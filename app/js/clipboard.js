import {
  $
} from './dom'
const pad = $('#pad')[0];

export default {
  uploadWhenPaste: function (cb) {
    pad.addEventListener("paste", function (e) {
      e.preventDefault();
      var cbd = e.clipboardData;
      var reader;

      // 如果是 Safari 直接 return
      if (!(e.clipboardData && e.clipboardData.items)) {
        return;
      }

      for (var i = 0; i < cbd.items.length; i++) {
        var item = cbd.items[i];
        if (item.kind == "file" && /^image/.test(item.type)) {
          reader = new FileReader();
          reader.onload = cb;
          reader.readAsDataURL(item.getAsFile());
        }
      }
    }, false);
  }
};
