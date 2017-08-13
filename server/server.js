const body_parser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// const auth_middleware = require('./middleware/permission_middleware');
app.engine('html', require('ejs').renderFile);
const cookie_parser = require('cookie-parser');
const session = require('express-session');
const redis = require('redis');
const redis_store = require('connect-redis')(session);
const client = redis.createClient();

const views = require('./routes/views');
const user_routes = require('./routes/user_routes');
const league_routes = require('./routes/league_routes');
const team_routes = require('./routes/team_routes');
const draft_routes = require('./routes/draft_routes');
const image_routes = require('./routes/images');
const video_routes = require('./routes/videos');
const script_routes = require('./routes/scripts');
const node_modules_routes = require('./routes/node_modules');
const style_routes = require('./routes/styles');
const bower_routes = require('./routes/bower')

io.on('connection', function(socket){
  console.log('a user connected');
});

// Make io accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

app.use(body_parser.json());
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
app.use('/team', team_routes);
app.use('/draft', draft_routes);
app.use('/images', image_routes);
app.use('/videos', video_routes);
app.use('/bower_components', bower_routes);
app.use('/scripts', script_routes);
app.use('/node_modules', node_modules_routes);
app.use('/styles', style_routes);

const init = require('./services/init');
init.go();

http.listen(5000, function () {
  console.log('auction app listening on port 5000!');
});

// leaves the server up when exception occurs
process.on('uncaughtException', function (err) {
  console.log(err);
});