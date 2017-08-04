var express = require('express');
var router = express.Router();
var app = express();
var globals = require('../globals');

var basePath =  globals.clientBasePath;

router.get('/', function(req, res, next){
  res.render(basePath + '/views/index.html');
});

router.get('/views/*.html', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;