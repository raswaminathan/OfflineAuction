const q = require('q');
const qb = require('./query_builders/leagues_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function get(id) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.get(id), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function create(league) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.create(league), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function update(league) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.update(league), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function del(id) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.del(id), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function getAll() {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.getAll(), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  getAll: getAll
}
