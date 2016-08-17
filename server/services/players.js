var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var q = require('q');
var player_query_builder = require('./query_builders/player_query_builder');
var basic_db_utility = require('./basic_db_utility');

function add_player(player) {
    var deferred = q.defer();

    var addPlayerCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var addPlayerQuery = player_query_builder.buildQueryForAddPlayer(player);
    basic_db_utility.performSingleRowDBOperation(addPlayerQuery, addPlayerCallback);

    return deferred.promise;
};

function get_all_available_players() {
    var deferred = q.defer();

    var getPlayersCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var getAllPlayersQuery = player_query_builder.buildQueryForGetAllAvailablePlayers();
    basic_db_utility.performMultipleRowDBOperation(getAllPlayersQuery, getPlayersCallback);

    return deferred.promise;
};

module.exports = {
    add_player: add_player,
    get_all_available_players: get_all_available_players
}
