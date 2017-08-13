const q = require('q');
const qb = require('./query_builders/sports_qb');
const db = require('./basic_db_utility');

function create(sport) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
        deferred.reject(result);
    } else {
        deferred.resolve(result);
    }
  };

  db.performSingleRowDBOperation(qb.create(sport), callback);

  return deferred.promise;
};

function get_all_sports() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
        deferred.reject(result);
    } else {
        deferred.resolve(result);
    }
  };

  db.performMultipleRowDBOperation(qb.get_all(), callback);

  return deferred.promise;
};

function get_sport_by_name(name) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
        deferred.reject(result);
    } else {
        deferred.resolve(result);
    }
  };

  db.performSingleRowDBOperation(qb.get_by_name(name), callback);

  return deferred.promise;
};

module.exports = {
  create: create,
  get_all_sports: get_all_sports,
  get_sport_by_name: get_sport_by_name
}
