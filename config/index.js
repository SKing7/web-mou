var defaultConfig = {
  root: process.cwd(),
  doc: {
    path: '/docs',
    imagePath: '/docs/images',
  },
  web: {
    port: 8000,
    host: '0.0.0.0',
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
