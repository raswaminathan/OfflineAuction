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

function add_player(info) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.add_player(info), globals.deferredResultCurry(deferred));
  return deferred.promise;
}

function remove_player(info) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.remove_player(info), globals.deferredResultCurry(deferred));
  return deferred.promise;
}

function get_players(team_id) {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.get_players(team_id), globals.deferredResultCurry(deferred));
  return deferred.promise;
}

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  add_player: add_player,
  remove_player: remove_player,
  get_players: get_players
}
