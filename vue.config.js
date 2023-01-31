const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        // https://parkweb.tainan.gov.tw/api/parking.php
        target: ' https://parkweb.tainan.gov.tw/api/',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
        ws: true
      },
      '/OpenData': {
        // https://hispark.hccg.gov.tw/OpenData/GetParkInfo
        target: 'https://hispark.hccg.gov.tw/OpenData',
        pathRewrite: { '^/OpenData': '' },
        changeOrigin: true,
        ws: true
      }
    }
  }
})
