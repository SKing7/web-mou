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

app.get('/demo', function (req, res) {
  res.render('demo');
});
// routes for app
app.get(DOC_PATH + '(:name)', function (req, res) {
  var params = req.params;
  var filePath = normalize(params.name);
  touch(filePath);
  fs.readFile(normalize(params.name), function (err, data) {
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
io.on('connection', function (socket) {
  socket.on('uploadPasteImage', function (imageBase64Data) {
    var base64Data = imageBase64Data.replace(/^data:image\/png;base64,/, "");
    var getImageFileName = function () {
      return (new Date().getTime() / 1000 + base64Data.slice(10, 15)) + '.png';
    };
    var fullImagePath = getImagesPath(getImageFileName());
    touch(fullImagePath);
    require("fs").writeFile(fullImagePath, base64Data, 'base64', function (err) {
      if (err) {
        socket.emit('imageUpload', {
          status: 2,
          msg: err.msg || '图片上传失败',
        });
      }
    });
  });
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
console.log('http://0.0.0.0:' + port + '/docs/');
server.listen(port);

function getImagesPath(fileName) {
  return [basePath, DOC_PATH, 'images', fileName].join(path.sep);
}

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
  return paths.join(path.sep);
}

function saveToFile(filePath, content) {
  return new Promise(function (resolve) {
    fs.writeFile(filePath, content, function (err) {
      resolve(err);
    })
  });
}
