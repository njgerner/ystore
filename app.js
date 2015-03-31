var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var errorHandler = require('errorhandler'); 
var favicon = require('serve-favicon');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('morgan');
var methodOverride = require('method-override');
var path = require('path');
var passport = require('passport');
var session = require('express-session');

// var routes = require('./routes/routes');

var app = express();

// view engine setup
// configure express to use handlebars templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('jwtTokenSecret', 'DEEZNUTS');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({ secret: 'supernova', 
                  saveUninitialized: true, 
                  resave: true,
                  cookie: {maxage: 60000 }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// development only
if ('development' == app.get('env')) {
  console.log('working in dev env');
  console.log('using the ' + process.env.DB + ' db');
  app.use(errorHandler());
}


// roll tide go hokies
require('./routes/routes.js')(express, app, __dirname);

module.exports = app;
