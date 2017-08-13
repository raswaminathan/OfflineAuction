const bcrypt = require('bcrypt');
const q = require('q');
const qb = require('./query_builders/users_qb');
const db = require('./basic_db_utility');
const globals = require('../globals');

function get(user) {
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.get(user), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function create(user){
  const deferred = q.defer();

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      db.performSingleRowDBOperation(qb.create(user, hash), globals.deferredResultCurry(deferred));
    });
  });

  return deferred.promise;
};

function update(user){
  const deferred = q.defer();

  const username = user.username;
  const newUsername = user.newUsername;
  const password = user.password;

  if (username == null || username == "") {
    deferred.reject({error: true});
    return deferred.promise;
  }
  if (newUsername == null || newUsername == "") {
    user.newUsername = username;
  }
  if (password != null && password != '') {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        db.performSingleRowDBOperation(qb.updateWithPassword(user, hash), globals.deferredResultCurry(deferred));
      });
    });
  } else {
    db.performSingleRowDBOperation(qb.updateWithoutPassword(user), globals.deferredResultCurry(deferred));
  }

  return deferred.promise;
};

function del(user) { // Deleting user by username
  const deferred = q.defer();
  db.performSingleRowDBOperation(qb.del(user), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function get_league_ids(user) {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.getLeagueIds(user), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

function compare_passwords(password, user) {
  const deferred = q.defer();
  bcrypt.compare(password, user.password, function(err, res) {
    deferred.resolve(res);
  });
  return deferred.promise;
};

function get_all() {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.getAll(), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

////////////////////////////////
// UNUSED FOR NOW
////////////////////////////////

function get_all_non_admin_users() {
  const deferred = q.defer();
  db.performMultipleRowDBOperation(qb.getAllNonAdmin(), globals.deferredResultCurry(deferred));
  return deferred.promise;
};

module.exports = {
  get: get,
  create: create,
  del: del,
  update: update,
  compare_passwords: compare_passwords,
  get_league_ids: get_league_ids,
  get_all: get_all,
  get_all_non_admin_users: get_all_non_admin_users
}
