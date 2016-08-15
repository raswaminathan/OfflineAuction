var express = require('express');
var router = express.Router();
var app = express();
var globals = require('../globals')

// sendFile needs full path
var basePath =  globals.clientBasePath + '/styles';

router.get('/*.css', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;