const squel = require('squel');
// const LEAGUE_TABLE = 'LEAGUE';
const TEAM_TABLE = 'TEAM';
const NAME = 'name';
const USER_ID = 'user_id'
const LEAGUE_ID = 'league_id'
const MONEY_REMAINING = 'money_remaining'

function get(id) {
  return squel.select().from(TEAM_TABLE).where("id = ?", id).toString();
};

function create(team) {
  return squel.insert()
            .into(TEAM_TABLE)
            .set(NAME, team.name)
            .set(USER_ID, team.user_id)
            .set(LEAGUE_ID, team.league_id)
            .set(MONEY_REMAINING, team.money_remaining)
            .toString();
};

function del(id) {
  return squel.delete().from(TEAM_TABLE).where("id = ?", id).toString();
};

function update(team) {
  return squel.update()
            .table(TEAM_TABLE)
            .where("id = ?", team.id)
            .set(NAME, team.name)
            .set(USER_ID, team.user_id)
            .set(LEAGUE_ID, team.league_id)
            .set(MONEY_REMAINING, team.money_remaining)
            .toString();
};

function getAll() {
  return squel.select().from(TEAM_TABLE).toString();
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get
}
