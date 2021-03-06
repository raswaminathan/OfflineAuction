const express = require('express');
const router = express.Router();
const team_service = require('../services/teams');

/// TODO:

// Add validations -- what happens when partial input is provided to create/update funcions
// Tests for these permutations 

router.get('/', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('id' in req.query)) {
    res.status(401).json({err: 'no id provided for get team'});
  } else {
    team_service.get(req.query.id).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(400).json(error);
    });
  }
});

router.put('/', function(req, res, next){
  // if (!req.session.user || !('username' in req.session.user)) {
  //   res.status(401).json({noSession: true});
  // } else {
    team_service.create(req.body).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  // }
});

router.post('/', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else {
    team_service.update(req.body).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  }
});

router.delete('/', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('id' in req.query)) {
    res.status(401).json({err: 'no id provided for get team'});
  } else {
    team_service.del(req.query.id).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  }
});

// ROSTER OPERATIONS -- should these require a session?!

router.post('/addPlayer', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else {
    team_service.add_player(req.body).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  }
});

router.post('/removePlayer', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else {
    team_service.remove_player(req.body).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  }
});

router.get('/players', function(req, res, next){
  if (!req.session.user || !('username' in req.session.user)) {
    res.status(401).json({noSession: true});
  } else if (!('team_id' in req.query)) {
    res.status(401).json({err: 'no team_id provided for get players'});
  } else {
    team_service.get_players(req.query.team_id).then(function(result) {
      res.status(200).json(result);
    }, function(error) {
      res.status(403).json(error);
    });
  }
});


module.exports = router;