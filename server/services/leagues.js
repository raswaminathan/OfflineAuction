const q = require('q');
const qb = require('./query_builders/leagues_qb');
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

  const query = qb.get(id);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function create(league) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.create(league);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function update(league) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.update(league);
  db.performSingleRowDBOperation(query, callback);

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

  const query = qb.del(id);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function getAll() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.getAll();
  db.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  getAll: getAll
}
