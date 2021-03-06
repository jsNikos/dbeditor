var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var httpProxy = require('http-proxy');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
var proxy = httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 9090
  }
});
proxy.on('error', console.log);
app.all('/ws*', function(req, res) {
  proxy.web(req, res);
});
app.all('/webapps*', function(req, res) {
  proxy.web(req, res);
});
app.all('/webfile*', function(req, res) {
  proxy.web(req, res);
});
app.all('/Login*', function(req, res) {
  proxy.web(req, res);
});
app.all('/ScaledImage*', function(req, res) {
  proxy.web(req, res);
});
app.all('/Image?*', function(req, res) {
  proxy.web(req, res);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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


module.exports = app;
