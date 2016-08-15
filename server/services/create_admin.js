var user_service = require('./users');

exports.createAdmin = function(callback) {

	var admin = {
		username: 'admin',
		password: 'admin'
	};

	user_service.create_user(admin).then(function(response) {
		console.log("admin successfully created");
    callback();
	}, function(error) {
		console.log("admin already created");
    callback();
	});
};
