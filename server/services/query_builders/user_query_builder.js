var squel = require('squel');

module.exports.buildQueryForCreateUser = function(user, hash) {
    return squel.insert().into("user")
            .set("username", user.username)
            .set("password", hash)
            .set("cash_remaining", 207)
            .set("remaining_roster_spots", 17)
            .toString();
};

module.exports.buildQueryForGetUser = function(user) {

    return squel.select()
            .from("user")
            .where("username = ?", user.username)
            .toString();
};

module.exports.buildQueryForGetAllUsers = function() {

    return squel.select()
            .from("user")
            .field("username")
            .field("user_id")
            .toString();
};

module.exports.buildQueryForGetAllNonAdminUsers = function() {

    return squel.select()
            .from("user")
            .where("username <> ?" , "admin")
            .toString();
};

module.exports.buildQueryForGetTeam = function(user) {

    return squel.select()
                .from("user")
                .left_join("user_player", null, "user_player.user_id = user.user_id")
                .left_join("player", null, "player.player_id = user_player.player_id")
                .where("user.user_id = ?", user.user_id)
                .toString();
};

module.exports.buildQueryForDeleteUser = function(username) {
    return squel.delete()
                .from("user")
                .where("username = '" + username + "'")
                .toString();
};
