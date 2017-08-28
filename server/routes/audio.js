const express = require('express');
const router = express.Router();
const app = express();
const globals = require('../globals')

// sendFile needs full path
const basePath =  globals.clientBasePath + '/audio';

router.get('/*.mp3', function(req, res, next){
  res.sendFile(basePath + req.path);
});

module.exports = router;