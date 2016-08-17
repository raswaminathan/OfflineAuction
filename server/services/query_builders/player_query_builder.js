var squel = require('squel');

module.exports.buildQueryForAddPlayer = function(player) {
    return squel.insert().into("player")
            .set("first_name", player.first_name)
            .set("last_name", player.last_name)
            .set("position", player.position)
            .set("team", player.team)
            .toString();
};

module.exports.buildQueryForGetAllAvailablePlayers = function(player) {
    return squel.select()
            .from("player")
            .where("available = 1")
            .toString()
};

