var body_parser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs');
//var https = require('https');
//var privateKey = fs.readFileSync('/opt/bitnami/apache2/conf/server.key', 'utf8');
//var certificate = fs.readFileSync('/opt/bitnami/apache2/conf/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

// var auth_middleware = require('./middleware/permission_middleware');
app.engine('html', require('ejs').renderFile);
var body_parser = require('body-parser');
var cookie_parser = require('cookie-parser');
var session = require('express-session');
var redis = require('redis');
var redis_store = require('connect-redis')(session);
var client = redis.createClient();

var views = require('./routes/views');
// // var tag_routes = require('./routes/tags');
// var user_routes = require('./routes/user_routes');
// var room_routes = require('./routes/room_routes');
// var game_routes = require('./routes/game_routes');
var image_routes = require('./routes/images');
var video_routes = require('./routes/videos');
var script_routes = require('./routes/scripts');
var node_modules_routes = require('./routes/node_modules');
var style_routes = require('./routes/styles');
var bower_routes = require('./routes/bower')
var initialize_tables = require('./services/initialize_tables');
var create_admin = require('./services/create_admin');

// var timer = require('./services/timer');

// var t = new timer();

// t.start();

// var shibboleth = require('./routes/shibboleth');

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
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
// // app.use('/tag', tag_routes);
// app.use('/user', user_routes);
// app.use('/room', room_routes);
// app.use('/game', game_routes);
app.use('/images', image_routes);
app.use('/videos', video_routes);
app.use('/bower_components', bower_routes);
app.use('/scripts', script_routes);
app.use('/node_modules', node_modules_routes);
app.use('/styles', style_routes);
// app.use('/', shibboleth);

initialize_tables.initializeDB(create_admin.createAdmin);

http.listen(5000, function () {
  console.log('auction app listening on port 5000!');
});

//var liars_test = require('./test/liars_test');
//liars_test.runTest();

//https.createServer(credentials, app).listen(443);

// leaves the server up when exception occurs

process.on('uncaughtException', function (err) {
    console.log(err);
});