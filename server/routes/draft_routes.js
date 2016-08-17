var express = require('express');
var router = express.Router();
var user_service = require('../services/users');
var player_service = require('../services/players');
var Timer = require('../services/timer');
var draft = {};
var currentTurnIndex= -1;
var timerOut = false;

var registerTimerEvents = function(timer, req) {
    timer.on('tick:timer', function(time) {
      req.io.sockets.emit('timer tick ', { time: time });
    });

    timer.on('timer:out', function() {
        timerOut = true;

        var users = draft.users;

        users[currentHighBidIndex].cash_remaining -= currentHighBid;
        users[currentHighBidIndex].remaining_roster_spots--;

        // write to DB here ?

        if (users[currentHighBidIndex].remaining_roster_spots == 0) {
            users.splice(currentHighBidIndex, 1);
            req.io.sockets.emit('user done ' + users[currentHighBidIndex].user_id);
        }
        
        currentTurnIndex = findNextTurnIndex(users);
        emitTurnToNominateEvent(req, draft.users[currentTurnIndex].user_id);

    });

    timer.on('reset:timer', function(time) {
        req.io.sockets.emit('timer reset ', {time: time});
    });
};

// data contains user_id and player_id
var registerDraftEvents = function(req) {
    req.io.sockets.on('nominate player', function(data) {
        if (data.user_id == draft.users[currentTurnIndex].user_id) {
            var user_id = data.user_id;
            var player_id = data.player_id;
            var startingBid = data.startingBid;
            draft.currentNominatedPlayer = players[findIndexInArray(draft.players, player_id)];
            draft.currentHighBid = startingBid;
            draft.currentHighBidIndex = findIndexInArray(draft.users, user_id);
            resetAndStartTimer(draft.timer, 10);
            emitPlayerNominatedEvent(req, draft.currentNominatedPlayer, startingBid);

        } else {
            // do nothing for now i guess
        }
    });

    req.io.sockets.on('place bid', function(data) {
        if (timerOut) {
            return;
        }
        var user_id = data.user_id;
        var bid = data.bid;

        if (bid <= draft.currentHighBid) {
            return;
        }

        var user = user[findIndexInArray(draft.users, user_id)];

        var cashLeft = user.cash_remaining - bid;

        if (cashLeft < 0 || cashLeft < (user.remaining_roster_spots - 1)) {
            return;
        } else {
            draft.previousHighBid = draft.currentHighBid;
            draft.previousHighBidIndex = draft.currentHighBidIndex;
            draft.currentHighBid = bid;
            draft.currentHighBidIndex = findIndexInArray(draft.users, user_id);
            req.io.sockets.emit('bid placed', {currentHighBid: draft.currentHighBid, user_id: user_id});
            resetAndStartTimer(draft.timer, 10);
        }
    });
};

var resetAndStartTimer = function(timer, startValue) {
    timer.reset(startValue);
    timer.start();
};

var stopTimer = function(timer) {
    timer.stop();
};

var emitTurnToNominateEvent = function(req, user_id) {
    req.io.sockets.emit('user turn ' + user_id);
};

var emitPlayerNominatedEvent = function(req, player, startingBid) {
    req.io.sockets.emit('player nominated', {player: player, startingBid: startingBid});
};

var findNextTurnIndex = function(users) {
    if (currentTurnIndex == users.length - 1) {
        return 0;
    } else {
        return currentTurnIndex++;
    }
};

var findIndexInArray = function(users, user_id) {
    var user_ids = [];
    for (var i = 0; i<users.length; i++) {
        user_ids.push(users[i].user_id);
    }

    return user_ids.indexOf(user_id);
};

router.post('/start', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {

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
                draft.timer = new Timer();
                registerTimerEvents(draft.timer, req);
                registerDraftEvents(req);
                currentTurnIndex = 0;
                emitTurnToNominateEvent(req, draft.users[currentTurnIndex].user_id);

            }, function(error) {
                console.log(error);
                res.status(400).json(error);
            });


        }, function(error) {
            console.log(error);
            res.status(403).json(error);
        });
        registerTimerEvents();

    }
});