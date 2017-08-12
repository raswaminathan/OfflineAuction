const q = require('q');
const qb = require('./query_builders/teams_qb');
const db = require('./basic_db_utility');

function get(id) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };
  db.performSingleRowDBOperation(qb.get(id), callback);

  return deferred.promise;
};

function create(team) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  db.performSingleRowDBOperation(qb.create(team), callback);

  return deferred.promise;
};

function update(team) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  db.performSingleRowDBOperation(qb.update(team), callback);

  return deferred.promise;
};

function del(id) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  db.performSingleRowDBOperation(qb.del(id), callback);

  return deferred.promise;
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get
}
