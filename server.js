#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var touch = require('touch');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var args = require('optimist').argv;

var basePath = args.docBase || process.cwd();

const DOC_PATH = '/docs/';


// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// public folder to store assets
app.use(express.static(__dirname + '/public'));

// routes for app
app.get(DOC_PATH + '(:name)', function (req, res) {
  var params = req.params;
  var filePath = normalize(params.name);
  touch(filePath);
  fs.readFile(normalize(params.name), function (err, data) {
    if (!err) {
      res.render('doc-creator', {
        markdownContent: data
      });
    } else {
      res.render('404');
    }
  });
});
io.on('connection', function (socket) {
  socket.on('docSave', function (data) {
    var fileName = pathToFileName(data.path);
    var filePath = normalize(fileName);
    var content = data.content;
    console.log('saving...:', content);

    saveToFile(filePath, content).then(function (err) {
      if (err) {
        socket.emit('docSaveDone', {
          status: 2,
          msg: err.msg,
        });
      } else {
        socket.emit('docSaveDone', {
          status: 1,
          msg: '',
        });
      }
    });
  });
});

// listen on port 8000 (for localhost) or the port defined for heroku
var port = process.env.PORT || 8000;
server.listen(port);

function pathToFileName(pathStr) {
  pathStr = pathStr.replace(new RegExp('^' + DOC_PATH), '');
  return pathStr;
}

function normalize(fileName) {
  var paths = [basePath, 'docs'];
  if (/\.md$/.test(fileName)) {
    paths.push(fileName);
  } else {
    paths.push(fileName + '.md');
  }
  return paths.join('/');
}

function saveToFile(filePath, content) {
  return new Promise(function (resolve) {
    fs.writeFile(filePath, content, function (err) {
      resolve(err);
    })
  });
}
