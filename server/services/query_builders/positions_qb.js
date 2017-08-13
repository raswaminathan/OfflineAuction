const squel = require('squel');
const POSITION_TBL = "PLAYER_POSITION";

function create(position) {
  return squel.insert().into(POSITION_TBL)
          .set('name', position.name)
          .set('sport_id', position.sport_id)
          .toString();
};

function get_all() {
  return squel.select()
          .from(POSITION_TBL)
          .toString()
};

function get_by_name(name) {
  return squel.select()
          .from(POSITION_TBL)
          .where('name = "' + name + '"')
          .toString()
};

module.exports = {
  create: create,
  get_all: get_all,
  get_by_name: get_by_name
}
