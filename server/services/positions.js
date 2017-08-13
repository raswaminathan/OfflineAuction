const q = require('q');
const qb = require('./query_builders/positions_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function create(position) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.create(position), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function get_all_positions() {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.get_all(), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function get_position_by_name(name) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.get_by_name(name), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  create: create,
  get_all_positions: get_all_positions,
  get_position_by_name: get_position_by_name
}
