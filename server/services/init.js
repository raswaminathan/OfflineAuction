var fs = require('fs');
var globals = require('../globals');
var sports_service = require('./sports');
var position_service = require('./positions');
var player_service = require('./players');
var q = require('q');

// FUTURE: make all of the API calls in here bulk calls!
// FUTURE: can make another abstraction for player's team -- not needed for now prolly

exports.go = function() {
  init_sports().then(init_positions).then(init_players);
};

function init_sports() {
  let sport_names = fs.readFileSync(globals.serverBasePath + '/conf/sports.txt', 'utf8').split('\n');
  let promises = [];

  sport_names.forEach(function(name) {
    let sport = {
      name: name
    };
    promises.push(sports_service.add_sport(sport));
  });

  return q.all(promises);
}

function init_positions() {
  let position_lines = fs.readFileSync(globals.serverBasePath + '/conf/positions.txt', 'utf8').split('\n');
  let promises = [];
  let position_names = [];

  position_lines.forEach(function(line) {
    let split = line.split(",");
    let sport_name = split[0];
    position_names.push(split[1]);

    promises.push(sports_service.get_sport_by_name(sport_name));
  });

  let promises2 = [];
  return q.all(promises)
    .then(function(results) {
      promises2 = [];
      for (var i = 0; i<results.length; i++) {      
        let position = {
          name: position_names[i],
          sport_id: results[i].results.id 
        };
        promises2.push(position_service.add_position(position));
      }
      return q.all(promises2);
    });
}

function init_players() {
  let player_lines = fs.readFileSync(globals.serverBasePath + '/conf/players.txt', 'utf8').split('\r');
  let promises = [];
  let splits = [];

  player_lines.forEach(function(line) {
    let split = line.split(",");
    splits.push(split);
    let position = split[2];
    promises.push(position_service.get_position_by_name(position));
  });

  return q.all(promises)
    .then(function(results) {
      promises2 = [];
      for (var i = 0; i<results.length; i++) {
        let split = splits[i];
        let player = {
          first_name: split[0],
          last_name: split[1],
          team: split[3],
          position_id: results[i].results.id
        };
        promises2.push(player_service.add_player(player));
      }
      return q.all(promises2);
    });
}