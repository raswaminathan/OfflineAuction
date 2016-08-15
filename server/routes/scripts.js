var express = require('express');
var router = express.Router();
var app = express();
var globals = require('../globals')

// sendFile needs full path
var basePath =  globals.clientBasePath + '/scripts';

router.get('/app.js', function(req, res, next){
  res.sendFile(basePath + '/app.js');
});

router.get('/controllers/*.js', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/services/*.js', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/directives/*.js', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;