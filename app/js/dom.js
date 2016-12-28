import {
  getCurFileName
} from './util'

export function $(s) {
  return document.querySelectorAll(s);
}
export function updateTree(data) {
  var items = data.items || [];
  var curFileName = getCurFileName(items);
  items = items.map(function (fileName) {
    return getHtml(fileName, curFileName);
  });
  var html = '<ul>' + items.join('') + '</ul>';
  $('.j-tree-view')[0].innerHTML = html;
  //$('.j-tree-title')[0].innerHTML = data.root;

  function getHtml(fileName, curFileName) {
    var className = fileName === curFileName ? ' class="active"' : '';
    return `
    <li${className}>
      <div class="whole-row"></div>
      <i class="icon-file"></i>
      <a href="${fileName}">${fileName}</a>
    </li>`;
  }
}
