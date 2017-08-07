var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var q = require('q');
var sports_builder = require('./query_builders/sports_query_builder');
var basic_db_utility = require('./basic_db_utility');

function add_sport(sport) {
    var deferred = q.defer();

    var addSportCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    let addSportRequest = sports_builder.buildQueryForAddSport(sport);
    basic_db_utility.performSingleRowDBOperation(addSportRequest, addSportCallback);

    return deferred.promise;
};

function get_all_sports() {
    var deferred = q.defer();

    var getSportsCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    let getAllSportsQuery = sports_builder.buildQueryForGetAllSports();
    basic_db_utility.performMultipleRowDBOperation(getAllSportsQuery, getSportsCallback);

    return deferred.promise;
};

function get_sport_by_name(name) {
    var deferred = q.defer();

    var getSportByNameCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    let getSportQuery = sports_builder.buildQueryForGetSportByName(name);
    basic_db_utility.performSingleRowDBOperation(getSportQuery, getSportByNameCallback);

    return deferred.promise;
};

module.exports = {
    add_sport: add_sport,
    get_all_sports: get_all_sports,
    get_sport_by_name: get_sport_by_name
}
