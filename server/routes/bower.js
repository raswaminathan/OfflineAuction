var express = require('express');
var router = express.Router();
var app = express();
var globals = require('../globals')

// sendFile needs full path
var basePath =  globals.clientBasePath + '/bower_components';

router.get('/*.js', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.css', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.woff', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.ttf', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/angular-playing-cards/angular-playing-cards.css', function(req, res, next){
  res.sendFile(basePath + '/angular-playing-cards/angular-playing-cards.css');
});

router.get('/angular-playing-cards/angular-playing-cards.js', function(req, res, next){
  res.sendFile(basePath + '/angular-playing-cards/angular-playing-cards.js');
});

router.get('/angular-playing-cards/angular-playing-cards.html', function(req, res, next){
  res.sendFile(basePath + '/angular-playing-cards/angular-playing-cards.html');
});

module.exports = router;