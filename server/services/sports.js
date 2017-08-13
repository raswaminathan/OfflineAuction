const q = require('q');
const qb = require('./query_builders/sports_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function create(sport) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.create(sport), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function get_all_sports() {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.get_all(), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function get_sport_by_name(name) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.get_by_name(name), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  create: create,
  get_all_sports: get_all_sports,
  get_sport_by_name: get_sport_by_name
}
