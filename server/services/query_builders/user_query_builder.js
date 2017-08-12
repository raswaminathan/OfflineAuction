const squel = require('squel');
const USER_TABLE = 'USER';
const TEAM_TABLE = 'TEAM';
const LEAGUE_TABLE = 'LEAGUE';
const USERNAME = 'username';
const PASSWORD = 'password';
const ADMIN_UN = 'admin';

module.exports.buildQueryForGetUser = function(user) {
  return squel.select()
            .from(USER_TABLE)
            .where("username = ?", user.username)
            .toString();
};

module.exports.buildQueryForCreateUser = function(user, hash) {
  return squel.insert()
            .into(USER_TABLE)
            .set(USERNAME, user.username)
            .set(PASSWORD, hash)
            .toString();
};

module.exports.buildQueryForDeleteUser = function(user) {
  return squel.delete()
            .from(USER_TABLE)
            .where("username = ?", user.username)
            .toString();
};

module.exports.buildQueryForUpdateUserWithPassword = function(user, hash) {
  return squel.update()
            .table(USER_TABLE)
            .where("username = ?", user.username)
            .set("username", user.newUsername)
            .set("password", hash)
            .toString();
};

module.exports.buildQueryForUpdateUserWithoutPassword = function(user) {
  return squel.update()
            .table(USER_TABLE)
            .where("username = ?", user.username)
            .set("username", user.newUsername)
            .set("password", user.password)
            .toString();
};

module.exports.buildQueryForGetLeagueIds = function(user) {
  return squel.select()
            .from(USER_TABLE)
            .field("league.id")
            .left_join(TEAM_TABLE, null, "user.id = team.user_id")
            .left_join(LEAGUE_TABLE, null, "team.league_id = team.id")
            .where("user.id = ?", user.id)
            .toString();
};

module.exports.buildQueryForGetAllUsers = function() {
  return squel.select()
            .from(USER_TABLE)
            .field(USERNAME)
            .field("user.id")
            .toString();
};

module.exports.buildQueryForGetAllNonAdminUsers = function() {
  return squel.select()
            .from(USER_TABLE)
            .where("username <> ?" , ADMIN_UN)
            .toString();
};
