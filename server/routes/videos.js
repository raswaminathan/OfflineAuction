var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
var basePath =  '/Users/rahulswaminathan/OfflineAuction/client/videos';

router.get('/*.mp4', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.webm', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.ogv', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.ogg', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;