var user_service = require('./users');

exports.createAdmin = function(err) {

	var admin = {
		username: 'admin',
		password: 'admin'
	};

	user_service.create_user(admin).then(function(response) {
		console.log("admin successfully created");
	}, function(error) {
		console.log("admin already created");
	});
};
