#!/usr/bin/env node

var fs = require('fs');
var config = require('config');
var path = require('path');
var touch = require('touch');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var args = require('optimist').argv;
var socketInit = require('./libs/socket');
var util = require('./libs/util');

var ROOT_PATH = config.get('root')
var DOC_PATH = config.get('doc.path')


// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// public folder to store assets
app.use(express.static(__dirname + '/public'));

app.get('/demo', function (req, res) {
  res.render('demo');
});
app.get(config.get('web.imagePath') + '/(:name)', function (req, res) {
  var params = req.params;
  var fullImagePath = util.getDocImagesPath(params.name);

  res.sendFile(fullImagePath);
})

// routes for app
app.get(DOC_PATH + '/(:name)', function (req, res) {
  var params = req.params;
  var filePath = util.normalizeDoc(params.name);
  touch(filePath);
  fs.readFile(filePath, function (err, data) {
    if (!err) {
      res.render('doc-creator', {
        markdownContent: data,
        filePath: filePath
      });
    } else {
      res.render('404');
    }
  });
});

socketInit(io);

// listen on port 8000 (for localhost) or the port defined for heroku
var port = config.get('web.port') || 8000;
console.log('http://' + config.get('web.host') + ':' + port + DOC_PATH);
server.listen(port);
