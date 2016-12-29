var ip = require('ip');

var defaultConfig = {
  root: process.cwd(),
  doc: {
    path: '/docs',
    imagePath: '/docs/images',
  },
  web: {
    port: 8001,
    host: ip.address(),
    imagePath: '/doc-images',
  },
  socketStatus: {
    PENDING: 0,
    SUCCESS: 1,
    FAIL: 2,
  }
}
module.exports = {
  get: function (key) {
    return eval('defaultConfig.' + key)
  },
}
