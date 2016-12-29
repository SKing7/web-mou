import {
  $
} from './dom'

import {
  instance
} from './socket'
const socket = instance();

import {
  saveDoc,
  checkAutoSave,
  convertTextAreaToMarkdown,
} from './util'

var pad = $('#pad')[0];
export default {
  init: function () {
    pad.addEventListener('input', convertTextAreaToMarkdown);

    $('#j-menu-autosave')[0].addEventListener('change', function (e) {
      checkAutoSave(e.target);
    });
    $('#j-menu-save-btn')[0].addEventListener('click', function () {
      saveDoc();
    });
    $('.j-tree-toggle')[0].addEventListener('click', function () {
      var ndHtml = $('html')[0];
      if (!ndHtml.classList.contains('tree-open')) {
        socket.emit('fetchDocList');
      }
      ndHtml.classList.toggle('tree-open');
    });
    $('.j-tree-view')[0].addEventListener('hover', function (e) {
      var ndTarget = e.target;
    });

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
}
