var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
var basePath =  '/Users/rahulswaminathan/OfflineAuction/client/images';

router.get('/*.svg', function(req, res, next){
  res.sendFile(basePath + req.path);
});

router.get('/*.png', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;