var express = require('express');
var router = express.Router();
var user_service = require('../services/users');
var player_service = require('../services/players');
var Timer = require('../services/timer');
var draft = {};
var currentTurnIndex= -1;
var timerOut = false;
var draftStarted = false;

var registerTimerEvents = function(timer, req) {
    timer.on('tick:timer', function(time) {
      req.io.sockets.emit('timer tick', { time: time });
    });

    timer.on('timer:out', function() {
        timerOut = true;

        var users = draft.users;
        var currentHighBidIndex = draft.currentHighBidIndex;
        var currentHighBid = draft.currentHighBid;

        users[currentHighBidIndex].cash_remaining -= currentHighBid;
        users[currentHighBidIndex].remaining_roster_spots--;

        // write to DB here ?

        if (users[currentHighBidIndex].remaining_roster_spots == 0) {
            users.splice(currentHighBidIndex, 1);
            req.io.sockets.emit('user done', {user_id: users[currentHighBidIndex].user_id});
        }

        // remove player from availablePlayers and add to draftedPlayers

        req.io.sockets.emit('player drafted', {player: draft.currentNominatedPlayer, user_id: users[currentHighBidIndex].user_id,
                                                amount: draft.currentHighBid});
        draft.draftedPlayers.push(draft.currentNominatedPlayer);
        draft.availablePlayers.splice(draft.currentNominatedPlayerIndex, 1);

        draft.currentNominatedPlayer = {};
        draft.currentHighBidIndex = -1;
        draft.currentNominatedPlayerIndex = -1;
        draft.currentHighBidIndex = -1;
        draft.currentHighBidUserId = -1;
        draft.currentHighBid = -1;

        draft.currentTurnIndex = findNextTurnIndex(users);
        draft.currentTurnUserId = draft.users[draft.currentTurnIndex].user_id;
        draft.currentState = 'nomination';
        emitTurnToNominateEvent(req, draft.users[draft.currentTurnIndex].user_id);

    });

    timer.on('reset:timer', function(time) {
        req.io.sockets.emit('timer reset', {time: time});
    });
};

// req.body contains player_id, and startingBid
router.post('/nominatePlayer', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
      if (req.session.user.user_id === draft.users[draft.currentTurnIndex].user_id) {
          var user_id = req.session.user.user_id;
          var player_id = Number(req.body.player_id);
          var startingBid = Number(req.body.startingBid);

          var user = draft.users[findIndexInArray(draft.users, user_id)];

          var cashLeft = user.cash_remaining - startingBid;

          if (cashLeft < 0 || cashLeft < (user.remaining_roster_spots - 1)) {
              res.status(400).json({message: "not enough cash left"});
              return;
          }
          draft.currentNominatedPlayer = draft.availablePlayers[findPlayerIndexInArray(draft.availablePlayers, player_id)];
          draft.currentNominatedPlayerIndex = findPlayerIndexInArray(draft.availablePlayers, player_id);
          draft.currentHighBid = startingBid;
          draft.currentHighBidIndex = findIndexInArray(draft.users, user_id);
          draft.currentHighBidUserId = user_id;
          resetAndStartTimer(draft.timer, 10);
          emitPlayerNominatedEvent(req, draft.currentNominatedPlayer, startingBid, user_id);
          draft.currentState = 'bid';
          res.status(200).json({});

      } else {
          res.status(400).json({});
      }
    }
});

// req.body contains bid
router.post('/placeBid', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
        var user_id = req.session.user.user_id;
        var bid = Number(req.body.bid);
        if (timerOut) {
            res.status(400).json({message: "timer out"});
            return;
        }


        if (bid <= draft.currentHighBid) {
            console.log(bid);
            console.log(draft.currentHighBid);
            res.status(400).json({message: "bid too low"});
            return;
        }

        var user = draft.users[findIndexInArray(draft.users, user_id)];

        var cashLeft = user.cash_remaining - bid;

        console.log(user.remaining_roster_spots);

        if (cashLeft < 0 || cashLeft < (user.remaining_roster_spots - 1)) {
            res.status(400).json({message: "not enough cash left"});
        } else {
            draft.previousHighBid = draft.currentHighBid;
            draft.previousHighBidIndex = draft.currentHighBidIndex;
            draft.currentHighBid = bid;
            draft.currentHighBidIndex = findIndexInArray(draft.users, user_id);
            draft.currentHighBidUserId = user_id;
            req.io.sockets.emit('bid placed', {currentHighBid: draft.currentHighBid, user_id: user_id});
            resetAndStartTimer(draft.timer, 10);
            res.status(200).json({});
        }
    }
});

var resetAndStartTimer = function(timer, startValue) {
    timer.reset(startValue);
    timer.start();
    timerOut = false;
};

var stopTimer = function(timer) {
    timer.stop();
};

var emitTurnToNominateEvent = function(req, user_id) {
    req.io.sockets.emit('user turn', {user_id: user_id});
};

var emitPlayerNominatedEvent = function(req, player, startingBid, user_id) {
    req.io.sockets.emit('player nominated', {player: player, startingBid: startingBid, user_id: user_id});
};

var findNextTurnIndex = function(users) {
    if (draft.currentTurnIndex === (users.length - 1)) {
        return 0;
    } else {
        return draft.currentTurnIndex + 1;
    }
};

var findPlayerIndexInArray = function(players, player_id) {
    var player_ids = [];
    for (var i = 0; i<players.length; i++) {
        player_ids.push(players[i].player_id);
    }

    return player_ids.indexOf(player_id);
};

var findIndexInArray = function(users, user_id) {
    var user_ids = [];
    for (var i = 0; i<users.length; i++) {
        user_ids.push(users[i].user_id);
    }

    return user_ids.indexOf(user_id);
};

router.get('/getAllAvailablePlayers', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
        if (draftStarted) {
          res.status(200).json({results: draft.availablePlayers});
        } else {
          player_service.get_all_available_players().then(function(result) {
              res.status(200).json(result);

          }, function(error) {
              console.log(error);
              res.status(400).json(error);
          });
        }
    }
});

router.get('/draftState', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
        if (draftStarted) {

          var toReturn = {
            currentHighBid: draft.currentHighBid,
            currentHighBidUserId: draft.currentHighBidUserId,
            availablePlayers: draft.availablePlayers,
            users: draft.users,
            currentTurnUserId: draft.currentTurnUserId,
            currentState: draft.currentState,
            currentNominatedPlayer: draft.currentNominatedPlayer
          }
          res.status(200).json(toReturn);
        } else {
          res.status(400).json({});
        }
    }
});

router.post('/start', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {

        if (draftStarted) {
          res.status(400).json({message: "draft already started"});
          return;
        }
        user_service.get_all_non_admin_users().then(function(result) {
            draft.users = result.results;

            player_service.get_all_available_players().then(function(result) {
                draft.availablePlayers = result.results;
                draft.draftedPlayers = [];
                draft.currentHighBid = -1;
                draft.currentHighBidIndex = -1;
                draft.previousHighBid = -1;
                draft.previousHighBidIndex = -1;
                draft.currentNominatedPlayer = {};
                draft.currentNominatedPlayerIndex = -1;
                draft.timer = new Timer();
                registerTimerEvents(draft.timer, req);
                draft.currentTurnIndex = 0;
                draft.currentTurnUserId = draft.users[draft.currentTurnIndex].user_id;
                draft.currentState = 'nomination';
                emitTurnToNominateEvent(req, draft.users[draft.currentTurnIndex].user_id);
                draftStarted = true;
                res.status(200).json({});

            }, function(error) {
                console.log(error);
                res.status(400).json(error);
            });


        }, function(error) {
            console.log(error);
            res.status(403).json(error);
        });
    }
});

module.exports = router;
