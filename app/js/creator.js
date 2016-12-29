import clipboardUtil from './clipboard';
import bindSocket from './bindSocket';
import bindDom from './bindDOM';
import {
  $
} from './dom'
import {
  updateImageUploadStatus,
  updateSaveStatus,
  convertTextAreaToMarkdown,
  checkAutoSave
} from './util'

import {
  instance
} from './socket'

const socket = instance();
var PENDING = 0;
var SUCCESS = 1;
var FAIL = 2;


function bindEvent() {
  bindDom.init();
  bindSocket.init();

  clipboardUtil.uploadWhenPaste(function (e) {
    var fileName = (new Date().getTime() + '' + ((Math.random() * 1000) | 0)) + '.png'
    updateImageUploadStatus({
      status: PENDING,
      data: {
        name: fileName
      }
    })
    socket.emit('uploadPasteImage', {
      name: fileName,
      base64Data: e.target.result
    });
  });
}

export default {
  init: function () {
    convertTextAreaToMarkdown();
    checkAutoSave();
    bindEvent();

    HTMLTextAreaElement.prototype.insertAtCursor = function (targetValue) {
      var $t = this;
      if ($t.selectionStart || $t.selectionStart == '0') {
        var startPos = $t.selectionStart;
        var endPos = $t.selectionEnd;

        $t.value = $t.value.substring(0, startPos) + targetValue + $t.value.substring(endPos, $t.value.length);
        this.focus();
      } else {
        $t.value += targetValue;
        $t.focus();
      }
    }
  }
}
