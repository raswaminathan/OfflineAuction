const squel = require('squel');
const SPORT_TABLE = "SPORT";

function create(sport) {
  return squel.insert().into(SPORT_TABLE)
          .set('name', sport.name)
          .toString();
};

function get_all() {
  return squel.select()
          .from(SPORT_TABLE)
          .toString()
};

function get_by_name(name) {
  return squel.select()
          .from(SPORT_TABLE)
          .where('name = "' + name + '"')
          .toString()
};

module.exports = {
  create: create,
  get_all: get_all,
  get_by_name: get_by_name
}
