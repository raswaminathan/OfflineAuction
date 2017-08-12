var body_parser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');

// var auth_middleware = require('./middleware/permission_middleware');
app.engine('html', require('ejs').renderFile);
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var redis = require('redis');
var redis_store = require('connect-redis')(session);
var client = redis.createClient();

var views = require('./routes/views');
var user_routes = require('./routes/user_routes');
var league_routes = require('./routes/league_routes');
var draft_routes = require('./routes/draft_routes');
var image_routes = require('./routes/images');
var video_routes = require('./routes/videos');
var script_routes = require('./routes/scripts');
var node_modules_routes = require('./routes/node_modules');
var style_routes = require('./routes/styles');
var bower_routes = require('./routes/bower')
var initialize_tables = require('./services/initialize_tables');
var create_admin = require('./services/create_admin');

io.on('connection', function(socket){
  console.log('a user connected');

});

// Make io accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

app.use(body_parser.json());
// Added for Duke Shibboleth POST
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_parser());

app.use(session({
    secret: 'ssshhhhh',
    store: new redis_store({ host: 'localhost', port: 6379, client: client,ttl :  2600}),
    saveUninitialized: false,
    resave: false,
  key: 'sid'
}));

// app.use(auth_middleware.api_auth);
// app.use(auth_middleware.populate_permissions);

app.use('/', views);
//app.use('/views', views);

app.use('/user', user_routes);
app.use('/league', league_routes);
app.use('/draft', draft_routes);
app.use('/images', image_routes);
app.use('/videos', video_routes);
app.use('/bower_components', bower_routes);
app.use('/scripts', script_routes);
app.use('/node_modules', node_modules_routes);
app.use('/styles', style_routes);

var init = require('./services/init');

var createAdminCallback = function() {
  init.go();
};

var initializeDBCallback = function() {
  create_admin.createAdmin(createAdminCallback);
};

initialize_tables.initializeDB(initializeDBCallback);

http.listen(5000, function () {
  console.log('auction app listening on port 5000!');
});

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
});