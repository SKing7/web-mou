import {
  instance
} from './socket'

import {
  updateSaveStatus,
} from './util'

const socket = instance();
export default {

  init: function () {
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
  }
}
