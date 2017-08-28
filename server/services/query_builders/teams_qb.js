const squel = require('squel');

// Constants for TEAM table
const TEAM_TABLE = 'TEAM';
const NAME = 'name';
const USER_ID = 'user_id'
const LEAGUE_ID = 'league_id'
const MONEY_REMAINING = 'money_remaining'

// Constants for ROSTER table
const ROSTER_TABLE = 'ROSTER';
const TEAM_ID = 'team_id';
const PLAYER_ID = 'player_id';
const COST = 'cost';
const DRAFT_POSITION = 'draft_position';

function get(id) {
  return squel.select()
            .from(TEAM_TABLE)
            .where("id = ?", id)
            .toString();
};

function create(team) {
  let a = squel.insert()
            .into(TEAM_TABLE)
            .set(NAME, team.name)
            .set(USER_ID, team.user_id)
            .set(LEAGUE_ID, team.league_id)
            .set(MONEY_REMAINING, team.money_remaining);

  if ('image' in team) {
    a.set('image', team.image)
  }

  return a.toString();
};

function del(id) {
  return squel.delete()
            .from(TEAM_TABLE)
            .where("id = ?", id)
            .toString();
};

function update(team) {
  let a = squel.update()
            .table(TEAM_TABLE)
            .where("id = ?", team.id)
            .set(NAME, team.name)
            .set(USER_ID, team.user_id)
            .set(LEAGUE_ID, team.league_id)
            .set(MONEY_REMAINING, team.money_remaining);

  if ('image' in team) {
    a.set('image', team.image)
  }

  return a.toString();
};

// ROSTER queries

function add_player(info) {
  let nominating_team_id = -1;
  if ('nominating_team_id' in info) {
    nominating_team_id = info.nominating_team_id;
  }
  return squel.insert()
            .into(ROSTER_TABLE)
            .set(TEAM_ID, info.team_id)
            .set(PLAYER_ID, info.player_id)
            .set(COST, info.cost)
            .set(DRAFT_POSITION, info.draft_position)
            .set('nominating_team_id', nominating_team_id)
            .toString();
}

function remove_player(info) {
  return squel.delete()
            .from(ROSTER_TABLE)
            .where("team_id = ? AND player_id = ?", info.team_id, info.player_id)
            .toString();
}

function get_players(team_id) {
  return squel.select()
            .from(ROSTER_TABLE)
            .field('player.id', 'player_id')
            .field('player.first_name')
            .field('player.last_name')
            .field('player.team')
            .field('player_position.name', 'position')
            .field('roster.cost')
            .field('roster.draft_position')
            .field('player.default_value')
            .left_join('player', null, 'roster.player_id = player.id')
            .left_join('player_position', null, 'player.position_id = player_position.id')
            .where("team_id = ?", team_id)
            .order('roster.cost', false)
            .toString();
}

module.exports = {
  create: create,
  update: update,
  del: del,
  get: get,
  add_player: add_player,
  remove_player: remove_player,
  get_players: get_players
}
