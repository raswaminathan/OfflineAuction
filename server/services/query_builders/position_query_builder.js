var squel = require('squel');
const POSITION_TBL = "PLAYER_POSITION";

module.exports.buildQueryForAddPosition = function(position) {
    return squel.insert().into(POSITION_TBL)
            .set('name', position.name)
            .set('sport_id', position.sport_id)
            .toString();
};

module.exports.buildQueryForGetAllPositions = function() {
    return squel.select()
            .from(POSITION_TBL)
            .toString()
};

module.exports.buildQueryForGetPositionByName = function(name) {
    return squel.select()
            .from(POSITION_TBL)
            .where('name = "' + name + '"')
            .toString()
};
