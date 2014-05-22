'use strict';

var express = require('express')
  , app = express()
  , accounts = require('./accounts')
  ;

app.engine('ejs', require('ejs').renderFile);

app.use(require('body-parser')());
app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  var accept = req.headers['accept'];
  // TODO: Proper content-negotiation and parsing of Accept header (deal with
  // q-values etc.)
  if (accept && accept === 'application/vnd.mason+json') {
    res.header('Content-Type', 'application/vnd.mason+json');
    req.viewDirectory = 'mason/';
  } else {
    res.header('Content-Type', 'text/html');
    req.viewDirectory = 'html/';
  }
  next();
});


/* main routes */
app.get('/', function(req, res){
  res.render(req.viewDirectory + 'index.ejs');
});

accounts(express, app);

/* error handling after routes */
app.use(logErrors);
app.use(errorHandler);

function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(500);
  res.removeHeader('Content-Type');
  res.header('Content-Type', 'text/plain');
  res.end('Internal Error');
}

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
