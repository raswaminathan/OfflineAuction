var db_sql = require('./db_wrapper');
var squel = require('squel');
var bcrypt = require('bcrypt');
var q = require('q');
var user_query_builder = require('./query_builders/user_query_builder');
var basic_db_utility = require('./basic_db_utility');

function create_user(user){
    //Creates user given all parameters
    var deferred = q.defer();
    var createUserCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            var createUserQuery = user_query_builder.buildQueryForCreateUser(user, hash);
            basic_db_utility.performSingleRowDBOperation(createUserQuery, createUserCallback);
        });
    });

    return deferred.promise;
}

function get_user(user) {
    var deferred = q.defer();

    var getUserCallback = function(result) {
        if (result.error) {
            deferred.reject(result);
        } else {
            deferred.resolve(result);
        }
    };

    var getUserQuery = user_query_builder.buildQueryForGetUser(user);
    basic_db_utility.performSingleRowDBOperation(getUserQuery, getUserCallback);

    return deferred.promise;
}

function delete_user(username, callback) {

    var deferred = q
    if (username == null) {
        callback({error: true});
        return;
    }

    var deleteUserQuery = user_query_builder.buildQueryForDeleteUser(username);
    basic_db_utility.performSingleRowDBOperation(deleteUserQuery, callback);
};

function compare_passwords(password, user, callback) {

    var deferred = q.defer();
    bcrypt.compare(password, user.password, function(err, res) {
        deferred.resolve(res);
    });

    return deferred.promise;
}

module.exports = {
    create_user: create_user,
    delete_user: delete_user,
    get_user: get_user,
    compare_passwords: compare_passwords
}
