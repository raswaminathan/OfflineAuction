const express = require('express');
const router = express.Router();
const Timer = require('../services/timer');
const league_service = require('../services/leagues');
const team_service = require('../services/teams');
const q = require('q');

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
    rebuildFromDb(league_id, req).then(function(result) {
      res.status(200).json({message: 'ready to go'});
    });
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
      req.io.sockets.emit('player nominated:' + league_id, {player: draft.currentNominatedPlayer, startingBid: startingBid, team_id: team_id});
      resetAndStartTimer(draft.timer);
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
        draft.currentHighBid = bid;
        draft.currentHighBidIndex = findTeamIndexInArray(draft.teams, team_id);
        draft.currentBidTeamId = team_id;
        req.io.sockets.emit('bid placed:' + league_id, {currentHighBid: draft.currentHighBid, team_id: team_id});
        resetAndStartTimer(draft.timer);
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
      resetAndStartTimer(draft.timer);
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
      
      resetRoundForDraft(req, league_id);
      res.status(200).json({});
    }
  }
});

router.post('/resetToPosition', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('league_id') in req.body) {
    res.status(400).json({message: 'must provide league_id when reseting to position'});
  } else if (!('draft_position') in req.body) {
    res.status(400).json({message: 'must provide draft_position when reseting to position'});
  } else {
    const league_id = req.body.league_id;
    const draft_position = req.body.draft_position;

    let draft = drafts[league_id];
    if (!draft.draftStarted  || !req.session.user.username === 'admin') {
      res.status(403).json({message: "Not admin / draft not started"});
    } else {
      if (!draft.draftPaused) {
        stopTimer(draft.timer);
      }
      league_service.reset_to_position(req.body).then(function(result) {
        rebuildFromDb(league_id, req).then(function(result) {
          res.status(200).json(result);
        });
      }, function(error) {
        res.status(403).json(error);
      });
    }
  }
});

function resetRoundForDraft(req, league_id) {
  let draft = drafts[league_id];
  draft.currentHighBid = -1;
  draft.currentHighBidIndex = -1;
  draft.currentNominatedPlayer = {};
  draft.currentNominatedPlayerIndex = -1;
  draft.currentBidTeamId = draft.teams[draft.currentTurnIndex].team_id;
  draft.currentState = 'nomination';

  draft.timerOut = false;
  draft.draftPaused = false;

  req.io.sockets.emit('reset round:' + league_id, {});
}

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
    let draftedPlayer = draft.currentNominatedPlayer;
    draftedPlayer.draft_position = draft.draft_position;
    draftedPlayer.nominating_turn_index = draft.currentTurnIndex;
    
    const player_info = {
      player_id: draftedPlayer.player_id,
      team_id: teams[currentHighBidIndex].team_id,
      cost: currentHighBid,
      draft_position: draft.draft_position,
      nominating_turn_index: draft.currentTurnIndex
    };

    team_service.add_player(player_info).then(function(result) {
      draft.draft_position = draft.draft_position + 1;

      req.io.sockets.emit('player drafted:' + league_id, {player: draftedPlayer, team_name: teams[currentHighBidIndex].name, amount: draft.currentHighBid});

      if (teams[currentHighBidIndex].remaining_roster_spots === 0 || teams[currentHighBidIndex].money_remaining <= 0) {
          req.io.sockets.emit('team done:' + league_id, {team_id: teams[currentHighBidIndex].team_id});
          teams.splice(currentHighBidIndex, 1);
      }

      draft.draftedPlayers.push(draftedPlayer);
      draft.availablePlayers.splice(draft.currentNominatedPlayerIndex, 1);

      if (teams.length === 0) {
        return;
      }

      draft.currentTurnIndex = findNextTurnIndex(draft, teams);
      resetRoundForDraft(req, league_id);
    })
  });

  timer.on('reset:timer', function(time) {
    drafts[league_id].timerOut = false;
    req.io.sockets.emit('timer reset:' + league_id, {time: time});
  });
};

function rebuildFromDb(league_id, req) {
  const deferred = q.defer();
  league_service.get(league_id).then(function(result) {
    const league = result.results;
    const num_positions = league.num_positions;
    league_service.start_draft(league_id).then(function(result) {
      drafts[league_id] = {};
      league_service.get_teams(league_id).then(function(result){
        drafts[league_id].teams = result.results;
        league_service.get_available_players(league_id).then(function(result){
          let draft = drafts[league_id];
          draft.availablePlayers = result.results;

          draft.timer = new Timer();
          draft.draftedPlayers = [];
          draft.currentTurnIndex = 0;

          let teams = draft.teams;
          for (var i = 0; i<teams.length; i++) {
            teams[i].remaining_roster_spots = num_positions;
          }

          draft.draft_position = 1;
          draft.draftStarted = true;

          registerTimerEvents(draft.timer, league_id, req);

          league_service.get_all_rosters(league_id).then(function(result) {
            var players = result.results;

            for (var i = 0; i<players.length; i++) {
              var player = players[i];
              var team_id = player.team_id;
              var player_id = player.player_id;
              var cost = player.cost;
              var draft_position = player.draft_position;
              var nominating_turn_index = player.nominating_turn_index;

              var teamIndex = findTeamIndexInArray(teams, team_id);
              var team = teams[teamIndex];

              var playerIndex = findPlayerIndexInArray(player_id, draft.availablePlayers);

              team.remaining_roster_spots--;
              team.money_remaining = team.money_remaining - cost;
              draft.draft_position = draft_position + 1;
              draft.availablePlayers.splice(playerIndex, 1);
              draft.draftedPlayers.push(player);
            }

            for (var i = teams.length-1; i>=0; i--) {
              var team = teams[i];
              if (team.remaining_roster_spots <= 0 || team.money_remaining <= 0) {
                teams.splice(i, 1);
              }
            }

            if (players.length > 0) {
              var lastPlayer = players[players.length - 1];
              var nominating_turn_index = lastPlayer.nominating_turn_index;
              draft.currentTurnIndex = nominating_turn_index;
              draft.currentTurnIndex = findNextTurnIndex(draft, teams);
            } else {
              draft.currentTurnIndex = 0;
            }

            resetRoundForDraft(req, league_id);

            deferred.resolve({blah: "blah"});
          })
        })
      })
    })
  })

  return deferred.promise;
}

function resetAndStartTimer(timer) {
  if (timer.getTime() > 10 || timer.getTime() == 0) {
    // timer.reset(20);
    timer.reset(5);
  } else {
    // timer.reset(10);
    timer.reset(5);
  }
  timer.start();
};

function stopTimer(timer) {
  timer.stop();
};

function findNextTurnIndex(draft, teams) {
  if (draft.currentTurnIndex >= (teams.length - 1)) {
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
