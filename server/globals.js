const path = require('path');

function deferredResultCurry(deferred) {
  return function(result) {
    if (result.error) {
      deferred.reject(result);
    } else {
      deferred.resolve(result);
    }
  }
}

module.exports = {
  deferredResultCurry: deferredResultCurry,
  basePath: path.resolve(__dirname + "/.."),
  clientBasePath: path.resolve(__dirname + "/../client/"),
  serverBasePath: path.resolve(__dirname)
};

/// use globals.timer here to sync timer across app - theres only gonna be one timer so this is ok for this i guess