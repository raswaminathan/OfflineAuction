const squel = require('squel');

function create(player) {
  return squel.insert().into("player")
          .set("first_name", player.first_name)
          .set("last_name", player.last_name)
          .set("position_id", player.position_id)
          .set("team", player.team)
          .set("default_value", player.default_value)
          .toString();
};

// legacy -- will remove/update
function buildQueryForGetAllAvailablePlayers(player) {
  return squel.select()
          .from("player")
          .where("available = 1")
          .order("value", false)
          .toString()
};

module.exports = {
  create: create,
  buildQueryForGetAllAvailablePlayers: buildQueryForGetAllAvailablePlayers
}
