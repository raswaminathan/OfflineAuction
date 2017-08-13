const squel = require('squel');
const USER_TABLE = 'USER';
const TEAM_TABLE = 'TEAM';
const LEAGUE_TABLE = 'LEAGUE';
const USERNAME = 'username';
const PASSWORD = 'password';
const ADMIN_UN = 'admin';

function get(user) {
  return squel.select()
            .from(USER_TABLE)
            .where("username = ?", user.username)
            .toString();
};

function create(user, hash) {
  return squel.insert()
            .into(USER_TABLE)
            .set(USERNAME, user.username)
            .set(PASSWORD, hash)
            .toString();
};

function del(user) {
  return squel.delete()
            .from(USER_TABLE)
            .where("username = ?", user.username)
            .toString();
};

function updateWithPassword(user, hash) {
  return squel.update()
            .table(USER_TABLE)
            .where("username = ?", user.username)
            .set("username", user.newUsername)
            .set("password", hash)
            .toString();
};

function updateWithoutPassword(user) {
  return squel.update()
            .table(USER_TABLE)
            .where("username = ?", user.username)
            .set("username", user.newUsername)
            .set("password", user.password)
            .toString();
};

function getLeagueIds(user) {
  return squel.select()
            .from(USER_TABLE)
            .field("league.id")
            .left_join(TEAM_TABLE, null, "user.id = team.user_id")
            .left_join(LEAGUE_TABLE, null, "team.league_id = team.id")
            .where("user.id = ?", user.id)
            .toString();
};

function getAll() {
  return squel.select()
            .from(USER_TABLE)
            .field(USERNAME)
            .field("user.id")
            .toString();
};

function getAllNonAdminUsers() {
  return squel.select()
            .from(USER_TABLE)
            .where("username <> ?" , ADMIN_UN)
            .toString();
};

module.exports = {
  create: create,
  updateWithPassword: updateWithPassword,
  updateWithoutPassword: updateWithoutPassword,
  del: del,
  get: get,
  getAll: getAll,
  getAllNonAdminUsers: getAllNonAdminUsers,
  getLeagueIds: getLeagueIds
}
