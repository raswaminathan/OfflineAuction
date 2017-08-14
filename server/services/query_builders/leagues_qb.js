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

// select user.username, user.id as user_id, team.name, team.money_remaining, team.id as team_id from team
// left join user on (team.user_id = user.id) where team.league_id = 1;
function get_teams(league_id) {
  return squel.select()
            .from('team')
            .field('team.id', 'team_id')
            .field('team.name')
            .field('team.money_remaining')
            .field('user.username')
            .field('user.id', 'user_id')
            .left_join('user', null, 'team.user_id = user.id')
            .where('team.league_id = ?', league_id)
            .toString();
}

// select player.id, player.first_name, player.last_name, player.team, player.default_value, player_position.name as position from player
// left join player_position on (player.position_id = player_position.id) where player.id in
// (select player_id from roster where team_id = (select id from team where (league_id = 1)));
function get_available_players(league_id) {
  return squel.select()
            .from('player')
            .field('player.id', 'player_id')
            .field('player.first_name')
            .field('player.last_name')
            .field('player.team')
            .field('player_position.name', 'position')
            .field('player.default_value')
            .left_join('player_position', null, 'player.position_id = player_position.id')
            .where('player.id NOT IN ?', squel.select().field('player_id').from('roster').where('team_id IN ?', squel.select().field('id').from('team').where('league_id = ?', league_id)))
            .toString();
};

function reset_to_position(info) {
  return squel.delete()
            .from('roster')
            .where('team_id in ? AND draft_position > ?', squel.select().field('id', 'team_id').from('team').where('team.league_id = ?', info.league_id), info.draft_position)
            .toString();
}

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  getAll: getAll,
  get_teams: get_teams,
  get_available_players: get_available_players,
  reset_to_position: reset_to_position
}
