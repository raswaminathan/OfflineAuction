var express = require('express');
var router = express.Router();
var user_service = require('../services/users');

router.get('/', function(req, res, next){
    if (!req.session.user || !('username' in req.session.user)) {
        res.status(401).json({noSession: true});
    } else {
        res.status(200).json(req.session.user);
    }
});

router.put('/', function(req, res, next){
    //create user

    if(!('username' in req.body) || !('password' in req.body)){
        res.status(401).json({err: "no username or password provided"});
    } else {
        user_service.create_user(req.body).then(function(result) {
            res.status(200).json(result);
        }, function(error) {
            res.status(403).json(error);
        });
    }
});

router.post('/signin', function(req, res, next){
    //login user
    user_service.get_user(req.body)
    .then(function(user) {
        user_service.compare_passwords(req.body.password, user.results)
        .then(function(result) {
            if (result) {
                user.results.password = '';
                req.session.isValid = true;
                req.session.user = user.results;
                res.status(200).json(user.results);
            } else {
                res.status(403).json(result);
            }
        })
    });
});

router.post('/signout', function(req, res, next){
    req.session.destroy(function() {
        res.type('text/plain');
        res.status(200).json({results: 'YOU ARE LOGGED OUT'});
    });
});

module.exports = router;