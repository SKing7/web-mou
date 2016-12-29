#!/usr/bin/env node

var fs = require('fs');
var config = require('../config');
var path = require('path');
var touch = require('touch');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var socketInit = require('./libs/socket');
var util = require('./libs/util');
var glob = require("glob")
var argv = require('yargs').argv;

var ROOT_PATH = config.get('root')
var DOC_PATH = config.get('doc.path')

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/../dist'))
app.set('views', __dirname + '/views');

var PAGE_ENV = {
  dev: argv.dev
}

// public folder to store assets

app.get('/demo', function (req, res) {
  res.render('demo', {
    env: PAGE_ENV
  });
});
app.get(config.get('web.imagePath') + '/(:name)', function (req, res) {
  var params = req.params;
  var fullImagePath = util.getDocImagesPath(params.name);

  res.sendFile(fullImagePath);
})

// routes for app
app.get(DOC_PATH + '/(:name)', function (req, res) {
  var params = req.params;
  var name = params.name;
  if (!checkDocUrl(name)) {
    res.render('404');
    return;
  }
  var filePath = util.normalizeDoc(params.name);
  touch(filePath);
  fs.readFile(filePath, function (err, data) {
    if (!err) {
      res.render('doc-creator', {
        markdownContent: data,
        filePath: filePath,
        env: PAGE_ENV
      });
    } else {
      res.render('404');
    }
  });
});
app.use(function (req, res, next) {
  res.status(404);
  // respond with html page
  if (req.accepts('html')) {
    res.render('404', {
      url: req.url
    });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({
      error: 'Not found'
    });
    return;
  }
  // default to plain-text. send()
  res.type('txt').send('Not found');
});

socketInit(io);

function checkDocUrl(name) {
  var arr = name.split('.');
  if (arr.length === 1 || arr[arr.length - 1] === 'md') {
    return true;
  }
}

// listen on port 8000 (for localhost) or the port defined for heroku
var port = config.get('web.port') || 8000;
console.log('http://' + config.get('web.host') + ':' + port + DOC_PATH);
server.listen(port);
