~ function () {

  var PENDING = 0;
  var SUCCESS = 1;
  var FAIL = 2;
  var socket = socketClient();
  var pad;
  var markdownArea;
  var converter;
  var autoSaveInterval;
  var previousMarkdownValue;

  window.onload = function () {
    converter = new showdown.Converter();
    pad = document.getElementById('pad');
    markdownArea = document.getElementById('markdown');
    previousMarkdownValue = pad.value;

    // convert on page load
    convertTextAreaToMarkdown();
    checkAutoSave($$$('#j-menu-autosave')[0]);
    bindEvent();
  };
  // convert text area to markdown html
  var convertTextAreaToMarkdown = function () {
    var markdownText = pad.value;
    html = converter.makeHtml(markdownText);
    markdownArea.innerHTML = html;
  };

  function bindEvent() {
    bindkeydown();
    bindSocket();

    pad.addEventListener('input', convertTextAreaToMarkdown);

    $$$('#j-menu-autosave')[0].addEventListener('change', function (e) {
      checkAutoSave(e.target);
    });
    $$$('#j-menu-save-btn')[0].addEventListener('click', function () {
      save();
    });
    // $$$('#j-open-file')[0].addEventListener('click', function () {
    //   socket.emit('fetchDocList');
    // });
  }

  function checkAutoSave(ndTarget) {
    var checked = ndTarget.checked;
    if (checked && !autoSaveInterval) {
      bindAutoSave();
    } else if (!checked && autoSaveInterval) {
      window.clearInterval(autoSaveInterval);
    }
  }

  function updateImageUploadStatus(res) {
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

  function bindSocket() {
    socket.on('docSaveDone', function (data) {
      updateSaveStatus(data.status);
      window.setTimeout(function () {
        updateSaveStatus();
      }, 1500);
    });

    socket.on('imageUploadDone', function (res) {
      updateImageUploadStatus(res)
    });

    socket.on('fetchDocListDone', function (res) {
      console.log(res);
    });

    window.clipboardUtil.uploadWhenPaste(pad, function (e) {
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
        save();
      }
    }, 5000);

  }

  function save() {
    socket.emit('docSave', {
      path: getPath(),
      content: pad.value
    });
  }

  function bindkeydown() {
    // make the tab act l ike a tab
    pad.addEventListener('keydown', function (e) {
      if (e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var target = e.target;
        var value = target.value;

        // set textarea value to: text before caret + tab + text after caret
        target.value = value.substring(0, start) +
          "\t" +
          value.substring(end);

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
      }
    });
  }

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

  function updateSaveStatus(status) {
    var id = $$$('#j-save-status')[0];
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

  function $$$(s) {
    return document.querySelectorAll(s);
  }

  function socketClient() {
    var socket = new io();
    return socket;
  }

  function getPath() {
    var pathName = document.location.pathname;
    return pathName
  }
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
}()
