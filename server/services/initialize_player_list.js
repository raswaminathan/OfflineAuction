var fs = require('fs');
var readline = require('readline');
var globals = require('../globals');
var player_service = require('./players')

exports.initialize = function() {

  var rl = readline.createInterface({
    input: fs.createReadStream(globals.serverBasePath + '/player_list.txt'),
    terminal: false
  });

  rl.on('line', function(chunk){

      var split = chunk.split(",");
      var player = {
        first_name: split[0],
        last_name: split[1],
        position: split[2],
        team: split[3],
        value: split[4],
        available: 1
      };

      player_service.add_player(player);
  });

  rl.on('close', function(){

  });

};
