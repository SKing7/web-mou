import {
  instance
} from './socket'
import {
  updateTree
} from './dom'
import {
  updateImageUploadStatus,
} from './util'

const socket = instance();

import {
  updateSaveStatus,
} from './util'

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
      updateTree(res.data)
    });
  }
}
