const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/apiTainan': {
        target: 'http://parkweb.tainan.gov.tw:2968/api/',
        pathRewrite: { '^/apiTainan': '' },
        changeOrigin: true,
        ws: true
      },
      '/apiHsinchu': {
        // https://hispark.hccg.gov.tw/OpenData/GetParkInfo
        target: 'https://hispark.hccg.gov.tw',
        pathRewrite: { '^/apiHsinchu': '' },
        changeOrigin: true,
        ws: true
      }
    }
  }
})
