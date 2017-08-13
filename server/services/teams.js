const q = require('q');
const qb = require('./query_builders/teams_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function get(id) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.get(id), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function create(team) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.create(team), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function update(team) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.update(team), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function del(id) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.del(id), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get
}
