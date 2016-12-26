~ function () {
  window.poplist = function (ele, data) {
    var html = '<ul>';
    data.forEach(function (v) {
      html += '<li><a href="' + v + '">' + v + '</a></li>'
    });
    html += '</ul>';
    ele.appendChild(html);
    return html;
  }
}();
