const squel = require('squel');
const LEAGUE_TABLE = 'LEAGUE';
const NAME = 'name';
const NUM_TEAMS = 'num_teams'
const NUM_POSITIONS = 'num_positions'
const SALARY_CAP = 'salary_cap'
const DRAFT_TYPE = 'draft_type'

function get(id) {
  return squel.select().from(LEAGUE_TABLE).where("id = ?", id).toString();
};

function create(league) {
  return squel.insert()
            .into(LEAGUE_TABLE)
            .set(NAME, league.name)
            .set(NUM_TEAMS, league.num_teams)
            .set(NUM_POSITIONS, league.num_positions)
            .set(SALARY_CAP, league.salary_cap)
            .set(DRAFT_TYPE, league.draft_type)
            .toString();
};

function del(id) {
  return squel.delete().from(LEAGUE_TABLE).where("id = ?", id).toString();
};

function update(league) {
  return squel.update()
            .table(LEAGUE_TABLE)
            .where("id = ?", league.id)
            .set(NAME, league.name)
            .set(NUM_TEAMS, league.num_teams)
            .set(NUM_POSITIONS, league.num_positions)
            .set(SALARY_CAP, league.salary_cap)
            .set(DRAFT_TYPE, league.draft_type)
            .toString();
};

function getAll() {
  return squel.select().from(LEAGUE_TABLE).toString();
};

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  getAll: getAll
}
