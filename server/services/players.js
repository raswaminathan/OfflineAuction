const q = require('q');
const qb = require('./query_builders/players_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function create(player) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.create(player), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

// LEGACY
function get_all_available_players() {
  const deferred = q.defer();
  const query = qb.buildQueryForGetAllAvailablePlayers();
  db.performMultipleRowDBOperation(query, globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  create: create,
  get_all_available_players: get_all_available_players
}
