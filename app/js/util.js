import {
  $
} from './dom'

import {
  instance
} from './socket'

import showdown from 'showdown';
var PENDING = 0;
var SUCCESS = 1;
var FAIL = 2;

const socket = instance();
const pad = $('#pad')[0];
const markdownArea = $('#markdown')[0];
const converter = new showdown.Converter();
var autoSaveInterval;

var previousMarkdownValue = pad.value;

function updatePadUploadStatus(status) {
  if (status === PENDING) {
    id.innerHTML = '保存中...';
    id.classList.add('save-pending');
  } else if (status === SUCCESS) {
    id.innerHTML = '保存成功';
    id.classList.add('save-success');
  } else if (status === FAIL) {
    id.innerHTML = '保存失败';
    id.classList.add('save-fail');
  } else {
    id.innerHTML = '';
  }
}

export function updateSaveStatus(status) {
  var id = $('#j-save-status')[0];
  id.classList = [];
  if (status === PENDING) {
    id.innerHTML = '保存中...';
    id.classList.add('save-pending');
  } else if (status === SUCCESS) {
    id.innerHTML = '保存成功';
    id.classList.add('save-success');
  } else if (status === FAIL) {
    id.innerHTML = '保存失败';
    id.classList.add('save-fail');
  } else {
    id.innerHTML = '';
  }
}

export function checkAutoSave() {
  let ndTarget = $('#j-menu-autosave')[0];
  var checked = ndTarget.checked;
  if (checked && !autoSaveInterval) {
    bindAutoSave();
  } else if (!checked && autoSaveInterval) {
    window.clearInterval(autoSaveInterval);
  }
}

function getPath() {
  var pathName = document.location.pathname;
  return pathName
}

export function getCurFileName(items) {
  var pathName = getPath();

  if (/\/$/.test(pathName)) {
    pathName = pathName.slice(0, -1);
  }

  if (!/\.md$/.test(pathName)) {
    pathName += '.md';
  }


  var vv = '';
  items.some(function (v) {
    if (new RegExp(v + '$').test(pathName)) {
      vv = v;
    }
  })
  return vv;
}

export function saveDoc() {
  socket.emit('docSave', {
    path: getPath(),
    content: pad.value
  });
}


function bindAutoSave() {
  var didChangeOccur = function () {
    if (previousMarkdownValue != pad.value) {
      return true;
    }
    return false;
  };

  // check every second if the text area has changed
  autoSaveInterval = setInterval(function () {
    if (didChangeOccur()) {
      previousMarkdownValue = pad.value;
      updateSaveStatus(PENDING);
      saveDoc();
    }
  }, 5000);

}

export function updateImageUploadStatus(res) {
  var data = res.data;
  var status = res.status;
  var labelInMd = '[此处图片(' + data.name + ')上传中...]';

  if (status === SUCCESS) {
    pad.value = pad.value.replace(labelInMd, '![Image](' + data.webPath + ')');
  } else if (status === FAIL) {
    pad.value = pad.value.replace(labelInMd, '[图片上传失败]');
  } else {
    pad.insertAtCursor(labelInMd);
  }
  convertTextAreaToMarkdown();
}

export function convertTextAreaToMarkdown() {
  var markdownText = pad.value;
  var html = converter.makeHtml(markdownText);
  markdownArea.innerHTML = html;
};
