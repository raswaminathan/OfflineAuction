const bcrypt = require('bcrypt');
const q = require('q');
const user_query_builder = require('./query_builders/user_query_builder');
const basic_db_utility = require('./basic_db_utility');

function get_user(user) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = user_query_builder.buildQueryForGetUser(user);
  basic_db_utility.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function create_user(user){
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      const query = user_query_builder.buildQueryForCreateUser(user, hash);
      basic_db_utility.performSingleRowDBOperation(query, callback);
    });
  });

  return deferred.promise;
};

function update_user(user){
  const deferred = q.defer();

  const username = user.username;
  const newUsername = user.newUsername;
  const password = user.password;

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  if (username == null || username == "") {
    callback({error: true});
    return deferred.promise;
  }
  if (newUsername == null || newUsername == "") {
    user.newUsername = username;
  }
  if (password != null && password != '') {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        const query = user_query_builder.buildQueryForUpdateUserWithPassword(user, hash);
        basic_db_utility.performSingleRowDBOperation(query, callback);
      });
    });
  } else {
    const query = user_query_builder.buildQueryForUpdateUserWithoutPassword(user);
    basic_db_utility.performSingleRowDBOperation(query, callback);
  }

  return deferred.promise;
};

function delete_user(user) { // Deleting user by username
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = user_query_builder.buildQueryForDeleteUser(user);
  basic_db_utility.performSingleRowDBOperation(query, callback);

  return deferred.promise;
};

function get_league_ids(user) {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = user_query_builder.buildQueryForGetLeagueIds(user);
  basic_db_utility.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

function compare_passwords(password, user, callback) {
  const deferred = q.defer();

  bcrypt.compare(password, user.password, function(err, res) {
    deferred.resolve(res);
  });

  return deferred.promise;
};

function get_all_users() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = user_query_builder.buildQueryForGetAllUsers();
  basic_db_utility.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

////////////////////////////////
// UNUSED FOR NOW
////////////////////////////////

function get_all_non_admin_users() {
  const deferred = q.defer();

  function callback(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  };

  const query = user_query_builder.buildQueryForGetAllNonAdminUsers();
  basic_db_utility.performMultipleRowDBOperation(query, callback);

  return deferred.promise;
};

module.exports = {
  get_user: get_user,
  create_user: create_user,
  delete_user: delete_user,
  update_user: update_user,
  compare_passwords: compare_passwords,
  get_league_ids: get_league_ids,
  get_all_users: get_all_users,
  get_all_non_admin_users: get_all_non_admin_users
}
