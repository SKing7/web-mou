~ function () {

  var PENDING = 0;
  var SUCCESS = 1;
  var FAIL = 2;
  var socket = socketClient();

  window.onload = function () {
    var converter = new showdown.Converter();
    var pad = document.getElementById('pad');
    var markdownArea = document.getElementById('markdown');

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

    var previousMarkdownValue;

    // convert text area to markdown html
    var convertTextAreaToMarkdown = function () {
      var markdownText = pad.value;
      html = converter.makeHtml(markdownText);
      markdownArea.innerHTML = html;
    };

    var didChangeOccur = function () {
      if (previousMarkdownValue != pad.value) {
        return true;
      }
      return false;
    };

    // check every second if the text area has changed
    setInterval(function () {
      if (didChangeOccur()) {
        previousMarkdownValue = pad.value;
        updateSaveStatus(PENDING);
        socket.emit('docSave', {
          path: getPath(),
          content: pad.value
        });
        window.setTimeout(function () {
          updateSaveStatus();
        }, 1500);
      }
    }, 5000);

    // convert textarea on input change
    pad.addEventListener('input', convertTextAreaToMarkdown);

    // convert on page load
    convertTextAreaToMarkdown();
    bindEvent();
  };

  function bindEvent() {
    socket.on('docSaveDone', function (data) {
      updateSaveStatus(data.status);
    });

  }

  function updateSaveStatus(status) {
    var id = $$$('#j-save-status')[0];
    if (status === PENDING) {
      id.innerHTML = '保存中...';
    } else if (status === SUCCESS) {
      id.innerHTML = '保存成功';
    } else if (status === FAIL) {
      id.innerHTML = '保存失败';
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
}()
