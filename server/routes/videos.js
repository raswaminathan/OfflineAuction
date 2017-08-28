const express = require('express');
const router = express.Router();
const app = express();
const globals = require('../globals')

// sendFile needs full path
const basePath =  globals.clientBasePath + '/videos';

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