var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));

var routes = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/test',test)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var dbReady = mongoose.connectAsync('mongodb://localhost/test');
mongoose.connection.on('error', function(err) {
  console.error('[MongoDB] Connection Failed: ' + err);
  process.exit(32);
});

dbReady.then(function() {
  var port = 3800;
  return new Promise(function(resolve) {
    var server = app.listen(port, '127.0.0.1', function() {
      resolve(server);
    });
  });
}).then(function(server) {
  console.log('[database] Server listening on http://%s:%s/',
    server.address().address,
    server.address().port);
});

module.exports = app;
