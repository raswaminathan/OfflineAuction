var path = require('path');

var Globals = {
    basePath: path.resolve(__dirname + "/.."),
    clientBasePath: path.resolve(__dirname + "/../client/"),
    serverBasePath: path.resolve(__dirname)
}

module.exports = Globals;

/// use globals.timer here to sync timer across app - theres only gonna be one timer so this is ok for this i guess