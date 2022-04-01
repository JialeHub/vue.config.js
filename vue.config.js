const settings = require("./src/settings");

module.exports = {
  assetsDir: 'assets',
  "transpileDependencies": [
    "vuetify"
  ],
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "~@/styles/variables.scss"'
      },
      scss: {
        additionalData: '@import "~@/styles/variables.scss";'
      }
    }
  },
  pages: {
    index: {
      entry: './src/main.js',
      title: settings.title
    }
  },
  devServer: {
    "disableHostCheck": true,
    "https": false,
    "port": 806,
    proxy: {
      '/devApi/': {
        target: 'http://localhost:9006/',
        changeOrigin: true,
        pathRewrite: {
          '^/devApi/': ''
        }
      },
      '/prodApi/': {
        //target: 'http://121.196.153.82:8080/',
        target: 'http://localhost:9006/',
        changeOrigin: true,
        pathRewrite: {
          '^/prodApi/': ''
        }
      },
      "/baseURLMapQQ": {
        "target": "https://apis.map.qq.com",
        "pathRewrite": {
          "^/baseURLMapQQ": ""
        }
      }
    }
  },
  productionSourceMap: false,
}
