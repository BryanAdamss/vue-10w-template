'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const env =
  process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : require('../config/prod.env')

// * 2019-0111-添加资源导入插件
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

// * 2019-0124-添加prefetch
const PreloadWebpackPlugin = require('preload-webpack-plugin')

// * 生产环境根据不同打包模式导入不同资源
const HtmlWebpackIncludeAssets =
  process.env.BUILD_MODE === 'test'
    ? [
        './static/formula/katex/katex.css',
        './static/formula/katex/katex.min.js',
        './static/formula/mathjax/MathJax.js?config=TeX-AMS_CHTML',
        './static/formula/mathjax-config-cutom.js'
      ]
    : [
        // * 此处由于没有实际cdn地址，所以还是用和test模式一样的资源路径
        './static/formula/katex/katex.css',
        './static/formula/katex/katex.min.js',
        './static/formula/mathjax/MathJax.js?config=TeX-AMS_CHTML',
        './static/formula/mathjax-config-cutom.js'
      ]

// * 2020-0103- 添加webpack性能测量插件
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin({
  disable: !process.env.MEASURE // 通过env参数控制
})

// * 2020-0617-添加自动添加cdn插件(开发环境使用node_modules、生产使用cdn)
// * webpack 配置cdn原理文章https://www.jianshu.com/p/9248db0349fb
// * https://github.com/shirotech/webpack-cdn-plugin
// * webpack 3.x 使用webpack-cdn-plugin@1
// * webpack 4.x 使用webpack-cdn-plugin@latest
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const CDN_CONFIG = {
  modules: [
    {
      name: 'vue',
      var: 'Vue',
      path: 'dist/vue.runtime.min.js'
    },
    {
      name: 'vue-router',
      var: 'VueRouter',
      path: 'dist/vue-router.min.js'
    },
    {
      name: 'vuex',
      var: 'Vuex',
      path: 'dist/vuex.min.js'
    },
    {
      name: 'css-vars-ponyfill',
      var: 'cssVars',
      path: 'dist/css-vars-ponyfill.min.js'
    }
  ],
  prodUrl: '//cdn.jsdelivr.net/npm/:name@:version/:path'
}

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js')
    // * 2019-0111-调整生产环境输出的chunk名，使用base config中的chunkFilename
    // chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env,
      // * 2019-0111- 生产环境添加不同的BUILD_MODE
      'process.env.BUILD_MODE': JSON.stringify(process.env.BUILD_MODE),
      // * 2020-0103- 生产环境添加性能测量标志量
      'process.env.MEASURE': JSON.stringify(process.env.MEASURE)
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          // * 2019-0111-去除console及debugger
          drop_debugger: true,
          drop_console: true
        }
      },
      sourceMap: config.build.productionSourceMap,
      parallel: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename:
        process.env.NODE_ENV === 'testing' ? 'index.html' : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // * 2020-0617-webpack-cdn-plugin
    new WebpackCdnPlugin(CDN_CONFIG),
    // * 2019-0111-生产环境导入公式相关资源
    new HtmlWebpackIncludeAssetsPlugin({
      assets: HtmlWebpackIncludeAssets,
      append: false,
      publicPath: false
    }),
    // * 2019-0124-prefetch 所有异步chunk
    new PreloadWebpackPlugin({
      rel: 'prefetch'
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, '../node_modules')) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = smp.wrap(webpackConfig)
