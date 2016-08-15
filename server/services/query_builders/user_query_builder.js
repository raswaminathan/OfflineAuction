var squel = require('squel');

module.exports.buildQueryForCreateUser = function(user, hash) {
    return squel.insert().into("user")
            .set("username", user.username)
            .set("password", hash)
            .toString();
};

module.exports.buildQueryForGetUser = function(user) {
  
    return squel.select()
            .from("user")
            .where("username = ?", user.username)
            .toString();
};

module.exports.buildQueryForDeleteUser = function(username) {
    return squel.delete()
                .from("user")
                .where("username = '" + username + "'")
                .toString();
};
