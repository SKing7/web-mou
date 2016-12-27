var fs = require('fs');
var config = require('../config');
var path = require('path');
var touch = require('touch');

var socketStatus = config.get('socketStatus');
var ROOT_PATH = config.get('root')
var DOC_PATH = config.get('doc.path')
var DOC_IMAGE_PATH = config.get('doc.imagePath')
var imagePath = config.get('doc.path')
var PENDING = socketStatus.PENDING;
var SUCCESS = socketStatus.SUCCESS;
var FAIL = socketStatus.FAIL;

module.exports = {

  docFullPathToRelative: function (docs) {
    var prefix = this.getDocRootPath();
    return docs.map(function (v, i) {
      v = v.replace(prefix, '')
      return v;
    });
  },
  getDocRootPath: function (fileName) {
    var paths = [ROOT_PATH, DOC_PATH];
    return path.join.apply(path, paths);
  },
  normalizeDoc: function (fileName) {
    var paths = [this.getDocRootPath()];
    if (/\.md$/.test(fileName)) {
      paths.push(fileName);
    } else {
      paths.push(fileName + '.md');
    }
    return path.join.apply(path, paths);
  },
  emitDocSaveSuccess: function (socket, data) {
    socket.emit('docSaveDone', {
      status: SUCCESS,
      data: data,
    });
  },
  emitDocSaveError: function (socket, msg) {
    socket.emit('docSaveDone', {
      status: FAIL,
      msg: msg,
    });
  },
  emitImageSaveSuccess: function (socket, data) {
    socket.emit('imageUploadDone', {
      status: SUCCESS,
      data: data,
    });
  },
  emitImageSaveError: function () {
    socket.emit('imageUploadDone', {
      status: FAIL,
      msg: msg,
    });
  },
  getImageWebPath: function (fileName) {
    var HOST = config.get('web.host');
    var PORT = config.get('web.port');
    var IMAGE_WEB_PATH = config.get('web.imagePath');
    return 'http://' + [HOST + ':' + PORT, IMAGE_WEB_PATH, fileName || ''].join('/').replace(/\/\//g, '/');
  },
  getDocImagesPath: function (fileName) {
    return path.join(ROOT_PATH, DOC_IMAGE_PATH, fileName || '');
  },
  getDocWebPath: function (fileName) {
    var HOST = config.get('web.host');
    var PORT = config.get('web.port');
    return 'http://' + [HOST + ':' + PORT, DOC_PATH, fileName || ''].join('/').replace(/\/\//g, '/');
  },
};
