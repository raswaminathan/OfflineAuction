const q = require('q');
const qb = require('./query_builders/players_qb');
const db = require('./basic_db_utility');

function add_player(player) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
        deferred.reject(result);
    } else {
        deferred.resolve(result);
    }
  };

  const query = qb.buildQueryForAddPlayer(player);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function get_all_available_players() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
        deferred.reject(result);
    } else {
        deferred.resolve(result);
    }
  };

  const query = qb.buildQueryForGetAllAvailablePlayers();
  db.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

module.exports = {
  add_player: add_player,
  get_all_available_players: get_all_available_players
}
