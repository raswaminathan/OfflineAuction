var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var q = require('q');
var position_builder = require('./query_builders/position_query_builder');
var basic_db_utility = require('./basic_db_utility');

function add_position(position) {
    var deferred = q.defer();

    var callback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var query = position_builder.buildQueryForAddPosition(position);
    basic_db_utility.performSingleRowDBOperation(query, callback);

    return deferred.promise;
};

function get_all_positions() {
    var deferred = q.defer();

    var callback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var query = position_builder.buildQueryForGetAllPositions();
    basic_db_utility.performMultipleRowDBOperation(query, callback);

    return deferred.promise;
};

function get_position_by_name(name) {
    var deferred = q.defer();

    var callback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var query = position_builder.buildQueryForGetPositionByName(name);
    basic_db_utility.performSingleRowDBOperation(query, callback);

    return deferred.promise;
};

module.exports = {
    add_position: add_position,
    get_all_positions: get_all_positions,
    get_position_by_name: get_position_by_name
}
