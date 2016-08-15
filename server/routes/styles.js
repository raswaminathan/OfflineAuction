var express = require('express');
var router = express.Router();
var app = express();

// sendFile needs full path
var basePath =  '/Users/rahulswaminathan/OfflineAuction/client/styles';

router.get('/*.css', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;