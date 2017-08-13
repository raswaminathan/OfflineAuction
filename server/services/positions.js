const q = require('q');
const qb = require('./query_builders/positions_qb');
const db = require('./basic_db_utility');

function add_position(position) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.buildQueryForAddPosition(position);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function get_all_positions() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.buildQueryForGetAllPositions();
  db.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

function get_position_by_name(name) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = qb.buildQueryForGetPositionByName(name);
  db.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

module.exports = {
  add_position: add_position,
  get_all_positions: get_all_positions,
  get_position_by_name: get_position_by_name
}
