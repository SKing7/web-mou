var fs = require('fs');
var path = require('path');
var touch = require('touch');
var config = require('config');
var glob = require("glob")
var util = require('./util');


var DOC_PATH = config.get('doc.path')
var ROOT_PATH = config.get('root')
var socketStatus = config.get('socketStatus');

var PENDING = socketStatus.PENDING;
var SUCCESS = socketStatus.SUCCESS;
var FAIL = socketStatus.FAIL;

module.exports = function (io) {
  io.on('connection', function (socket) {
    socket.on('fetchDocList', function (res) {
      glob(util.getDocRootPath() + '/**/*.md', function (err, files) {
        socket.emit('fetchDocListDone', {
          data: util.docFullPathToRelative(files)
        });
      });
    });
    socket.on('uploadPasteImage', function (res) {
      //Todo check only png?
      var imageBase64Data = res.base64Data;
      var fileName = res.name;
      var base64Data = imageBase64Data.replace(/^data:image\/png;base64,/, "");
      var fullImagePath = util.getDocImagesPath(fileName);

      touch(fullImagePath);
      fs.writeFile(fullImagePath, base64Data, 'base64', function (err) {
        if (err) {
          util.emitImageSaveError(socket, err.msg);
          socket.emit('imageUpload', {
            msg: err.msg || '图片上传失败',
          });
        } else {
          util.emitImageSaveSuccess(socket, {
            name: fileName,
            webPath: util.getImageWebPath(fileName)
          });
        }
      });
    });

    socket.on('docSave', function (data) {
      var fileName = pathToFileName(data.path);
      var filePath = util.normalizeDoc(fileName);
      var content = data.content;

      if (!isPathLegal(data.path)) {
        util.emitDocSaveError(socket, "路径非法");
        return;
      }
      saveToFile(filePath, content).then(function (err) {
        if (err) {
          util.emitDocSaveError(socket, err.msg);
        } else {
          util.emitDocSaveSuccess(socket, {});
        }
      });
    });
  });
}

function saveToFile(filePath, content) {
  return new Promise(function (resolve) {
    fs.writeFile(filePath, content, function (err) {
      resolve(err);
    })
  });
}

function pathToFileName(pathStr) {
  pathStr = pathStr.replace(new RegExp('^' + DOC_PATH), '');
  return pathStr;
}

function isPathLegal(str) {
  return new RegExp('^' + DOC_PATH).test(str);
}
