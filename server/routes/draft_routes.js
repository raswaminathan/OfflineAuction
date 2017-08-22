const express = require('express');
const router = express.Router();
const Timer = require('../services/timer');
const league_service = require('../services/leagues');
const team_service = require('../services/teams');

const TIMER_RESET_TIME = 20;
const drafts = {};

router.post('/start', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
      res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
    return;
  } else if (req.body.league_id in drafts) {
    res.status(400).json({message: 'draft already started!!'});
  } else {
    const league_id = req.body.league_id;

    league_service.start_draft(league_id).then(function(result) {
      drafts[league_id] = {};
      league_service.get_teams(league_id).then(function(result){
        drafts[league_id].teams = result.results;
        league_service.get_available_players(league_id).then(function(result){
          let draft = drafts[league_id];
          draft.availablePlayers = result.results;
          draft.currentHighBid = -1;
          draft.currentHighBidIndex = -1;
          draft.previousHighBid = -1;
          draft.previousHighBidIndex = -1;
          draft.currentNominatedPlayer = {};
          draft.currentNominatedPlayerIndex = -1;
          draft.timer = new Timer();
          draft.timerOut = false;
          draft.currentTurnIndex = 0;
          draft.currentBidTeamId = draft.teams[draft.currentTurnIndex].team_id;
          draft.currentState = 'nomination';

          /// HACK
          let teams = draft.teams;
          for (var i = 0; i<teams.length; i++) {
            teams[i].remaining_roster_spots = 16;
          }

          draft.draftPosition = 1;
          draft.draftStarted = true;
          draft.draftPaused = false;

          registerTimerEvents(draft.timer, league_id, req);
          emitTurnToNominateEvent(req, league_id, draft.teams[draft.currentTurnIndex].team_id);

          res.status(200).json({message: 'ready to go'});
        })
      })
    })
  }
});

// req.body contains player_id, and startingBid
router.post('/nominatePlayer', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
      res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    // other validations

    const league_id = req.body.league_id;
    let draft = drafts[league_id];

    if (req.session.user.id === draft.teams[draft.currentTurnIndex].user_id) {
      const team_id = draft.teams[draft.currentTurnIndex].team_id;
      const player_id = Number(req.body.player_id);
      const startingBid = Number(req.body.startingBid);
      const team = draft.teams[findTeamIndexInArray(draft.teams, team_id)];
      const moneyLeft = team.money_remaining - startingBid;

      if (moneyLeft < 0 || moneyLeft < (team.remaining_roster_spots - 1)) {
        res.status(400).json({message: "not enough cash left"});
        return;
      }
      draft.currentNominatedPlayer = draft.availablePlayers[findPlayerIndexInArray(draft.availablePlayers, player_id)];
      draft.currentNominatedPlayerIndex = findPlayerIndexInArray(draft.availablePlayers, player_id);
      draft.currentHighBid = startingBid;
      draft.currentHighBidIndex = findTeamIndexInArray(draft.teams, team_id);
      draft.currentBidTeamId = team_id;
      emitPlayerNominatedEvent(req, league_id, draft.currentNominatedPlayer, startingBid, team_id);
      resetAndStartTimer(draft.timer, TIMER_RESET_TIME);
      draft.currentState = 'bid';
      res.status(200).json({});
    } else {
      console.log("Not your turn - " + req.session.user.id + " " + draft.teams[draft.currentTurnIndex].user_id);
      res.status(400).json({});
    }
  }
});

// req.body contains bid
router.post('/placeBid', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    // more validations

    const league_id = req.body.league_id;
    const team_id = req.body.team_id;
    const bid = Number(req.body.bid);

    let draft = drafts[league_id];

    if (draft.timerOut) {
      res.status(400).json({message: "timer out"});
      return;
    } else if (bid <= draft.currentHighBid) {
      res.status(400).json({message: "bid too low"});
      return;
    } else {
      const team = draft.teams[findTeamIndexInArray(draft.teams, team_id)];
      const moneyLeft = team.money_remaining - bid;
      if (moneyLeft < 0 || moneyLeft < (team.remaining_roster_spots - 1)) {
        res.status(400).json({message: "not enough cash left"});
      } else {
        draft.previousHighBid = draft.currentHighBid;
        draft.previousHighBidIndex = draft.currentHighBidIndex;
        draft.currentHighBid = bid;
        draft.currentHighBidIndex = findTeamIndexInArray(draft.teams, team_id);
        draft.currentBidTeamId = team_id;
        req.io.sockets.emit('bid placed:' + league_id, {currentHighBid: draft.currentHighBid, team_id: team_id});
        resetAndStartTimer(draft.timer, TIMER_RESET_TIME);
        res.status(200).json({});
      }
    }
  }
});

router.get('/state', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.query) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    const league_id = req.query.league_id;
    let draft = drafts[league_id];

    if (draft.draftStarted) {
      const toReturn = {
        currentHighBid: draft.currentHighBid,
        // currentHigh: draft.currentHighBidUserId,
        availablePlayers: draft.availablePlayers,
        teams: draft.teams,
        currentBidTeamId: draft.currentBidTeamId,
        currentState: draft.currentState,
        currentNominatedPlayer: draft.currentNominatedPlayer,
        draftPaused: draft.draftPaused
      }
      res.status(200).json(toReturn);
    } else {
      res.status(400).json({});
    }
  }
});

router.post('/pause', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    const league_id = req.body.league_id;
    let draft = drafts[league_id];

    if (!draft.draftStarted || draft.draftPaused || !req.session.user.username === 'admin') {
      res.status(403).json({message: "Not admin / draft not started"});
    } else {
      stopTimer(draft.timer);
      draft.draftPaused = true;
      req.io.sockets.emit('draft paused:' + league_id, {});
      res.status(200).json({});
    }
  }
});

router.post('/resume', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    const league_id = req.body.league_id;
    let draft = drafts[league_id];

    if (!draft.draftStarted || !draft.draftPaused || !req.session.user.username === 'admin') {
      res.status(403).json({message: "Not admin / draft not started"});
    } else {
      resetAndStartTimer(draft.timer, TIMER_RESET_TIME);
      draft.draftPaused = false;
      req.io.sockets.emit('draft resumed:' + league_id, {});
      res.status(200).json({});
    }
  }
});

router.post('/resetRound', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when starting draft'});
  } else {
    const league_id = req.body.league_id;
    let draft = drafts[league_id];

    if (!draft.draftStarted  || !req.session.user.username === 'admin') {
      res.status(403).json({message: "Not admin / draft not started"});
    } else {
      if (!draft.draftPaused) {
        stopTimer(draft.timer);
      }
      draft.currentState = 'nomination';
      draft.draftPaused = false;
      draft.currentHighBid = -1;
      draft.currentHighBidIndex = -1;
      draft.previousHighBid = -1;
      draft.previousHighBidIndex = -1;
      draft.currentNominatedPlayer = {};
      draft.currentNominatedPlayerIndex = -1;
      req.io.sockets.emit('reset round:' + league_id, {});
      res.status(200).json({});
    }
  }
});

function registerTimerEvents(timer, league_id, req) {
  timer.on('tick:timer', function(time) {
    req.io.sockets.emit('timer tick:' + league_id, { time: time });
  });

  timer.on('timer:out', function() {
    let draft = drafts[league_id];
    draft.timerOut = true;
    const teams = draft.teams;
    const currentHighBidIndex = draft.currentHighBidIndex;
    const currentHighBid = draft.currentHighBid;

    teams[currentHighBidIndex].money_remaining -= currentHighBid;
    teams[currentHighBidIndex].remaining_roster_spots--;

    // remove player from availablePlayers

    let draftedPlayer = draft.currentNominatedPlayer;
    draftedPlayer.draft_position = draft.draftPosition;
    const player_info = {
      player_id: draftedPlayer.player_id,
      team_id: teams[currentHighBidIndex].team_id,
      cost: currentHighBid,
      draft_position: draft.draftPosition
    };

    req.io.sockets.emit('player drafted:' + league_id, {player: draftedPlayer, team_name: teams[currentHighBidIndex].name,
                                            amount: draft.currentHighBid});

    if (teams[currentHighBidIndex].remaining_roster_spots === 0) {
        req.io.sockets.emit('team done:' + league_id, {team_id: teams[currentHighBidIndex].team_id});
        teams.splice(currentHighBidIndex, 1);
    }

    draft.availablePlayers.splice(draft.currentNominatedPlayerIndex, 1);

    if (teams.length === 0) {
      return;
    }

    draft.currentNominatedPlayer = {};
    draft.currentHighBidIndex = -1;
    draft.currentNominatedPlayerIndex = -1;
    draft.currentHighBidIndex = -1;
    // draft.currentHighBidUserId = -1;
    draft.currentHighBid = -1;
    draft.currentTurnIndex = findNextTurnIndex(draft, teams);
    draft.currentBidTeamId = teams[draft.currentTurnIndex].team_id;
    draft.currentState = 'nomination';
    emitTurnToNominateEvent(req, league_id, teams[draft.currentTurnIndex].team_id);
  });

  timer.on('reset:timer', function(time) {
    req.io.sockets.emit('timer reset:' + league_id, {time: time});
  });
};

function resetAndStartTimer(timer, startValue) {
  console.log(timer.time);
  if (timer.time / 1000 > 10) {
    timer.reset(TIMER_RESET_TIME);
  } else {
    timer.reset(10);
  }
  //timer.reset(startValue);
  timer.start();
  timerOut = false;
};

function stopTimer(timer) {
  timer.stop();
};

function emitTurnToNominateEvent(req, league_id, team_id) {
  req.io.sockets.emit('team turn:' + league_id, {team_id: team_id});
};

function emitPlayerNominatedEvent(req, league_id, player, startingBid, team_id) {
  req.io.sockets.emit('player nominated:' + league_id, {player: player, startingBid: startingBid, team_id: team_id});
};

function findNextTurnIndex(draft, teams) {
  if (draft.currentTurnIndex === (teams.length - 1)) {
    return 0;
  } else {
    return draft.currentTurnIndex + 1;
  }
};

function findPlayerIndexInArray(players, player_id) {
  var player_ids = [];
  for (var i = 0; i<players.length; i++) {
    player_ids.push(players[i].player_id);
  }

  return player_ids.indexOf(player_id);
};

function findTeamIndexInArray(teams, team_id) {
  var team_ids = [];
  for (var i = 0; i<teams.length; i++) {
    team_ids.push(teams[i].team_id);
  }

  return team_ids.indexOf(team_id);
};

module.exports = router;
