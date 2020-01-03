'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

// * 2020-0103- 添加thread-loader
// https://medium.com/@shinychang/webpack-%E6%9C%80%E4%BD%B3%E5%8C%96-thread-loader-bd18471ffb4c
const threadLoader = require('thread-loader')
const jsWorkerPool = { poolTimeout: 2000 }
threadLoader.warmup(jsWorkerPool, ['babel-loader']) // 预热

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    // * 2019-0111-调整开发、生产环境输出的包名
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js'),
    publicPath:
      process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
      // * 2019-0111-添加相关路径别名
      Api: resolve('src/api'),
      Assets: resolve('src/assets'),
      Base: resolve('src/base'),
      Config: resolve('src/config'),
      Components: resolve('src/components'),
      Directives: resolve('src/directives'),
      Routes: resolve('src/routes'),
      Sass: resolve('src/sass'),
      Store: resolve('src/store'),
      Services: resolve('src/services'),
      Plugins: resolve('src/plugins'),
      Views: resolve('src/views'),
      Utils: resolve('src/utils')
    }
  },
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        // * 2020-0103-添加thread-loader
        use: [
          {
            loader: 'thread-loader',
            options: jsWorkerPool
          },
          'babel-loader'
        ],
        // loader: 'babel-loader',
        include: [
          resolve('src'),
          resolve('test'),
          resolve('node_modules/webpack-dev-server/client')
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        // * 2019-0701-svg使用svgo svgo-loader及svg-sprite-loader处理
        exclude: [resolve('src/assets/svgs')],
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        // * 2019-0701-处理svg
        test: /\.svg$/,
        use: [
          { loader: 'svg-sprite-loader', options: {} },
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                // 还有很多配置，具体可以查看https://github.com/svg/svgo
                { removeViewBox: false },
                { removeXMLNS: true }
              ]
            }
          }
        ],
        include: [resolve('src/assets/svgs')]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
