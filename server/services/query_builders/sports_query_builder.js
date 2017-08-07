var squel = require('squel');
const SPORT_TABLE = "SPORT";

module.exports.buildQueryForAddSport = function(sport) {
    return squel.insert().into(SPORT_TABLE)
            .set('name', sport.name)
            .toString();
};

module.exports.buildQueryForGetAllSports = function() {
    return squel.select()
            .from(SPORT_TABLE)
            .toString()
};

module.exports.buildQueryForGetSportByName = function(name) {
    return squel.select()
            .from(SPORT_TABLE)
            .where('name = "' + name + '"')
            .toString()
};
