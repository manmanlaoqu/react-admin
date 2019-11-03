const path = require('path');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = function (webpackConfig) {
  //devtool assign empty string, then the project will not generate the map source
  webpackConfig.devtool = "source-map";

  //add historyApiFallback, you can change route after deploy
  webpackConfig.devServer = {
    historyApiFallback: true
  };

  let loaderList = webpackConfig.module.rules[1].oneOf;
  loaderList.splice(loaderList.length - 1, 0,
    {
      test: /^((?!module).)*\.scss$/,
      use: [
        {
          loader: "style-loader"
        },
        {
          loader: "css-loader"
        },
        {
          loader: "sass-loader"
        }
      ]
    },
    {
      test: /module.scss/,
      use: [
        {
          loader: "style-loader"
        },
        {
          loader: "css-loader",
          options: {
            modules: true,
            localIdentName: '[local]--[hash:base64:5]'
          }
        },
        {
          loader: "sass-loader",
          options: {
            importLoaders: 1,
          }
        }
      ]
    }
  );

  // let pluginsList = webpackConfig.plugins;


  // let UglifyJsPluginInstance = new ParallelUglifyPlugin({
  //   uglifyJS: {
  //     output: {
  //       comments: false,
  //       beautify: false,
  //     },
  //     compress: {
  //       warnings: false,
  //       drop_console: true,//删除console
  //     }
  //   }
  // });

  // pluginsList.splice(pluginsList.length - 1, 0, UglifyJsPluginInstance);

  Object.assign(webpackConfig.resolve.alias, {
    'images': path.resolve('./src/images'),
    'utils': path.resolve('./src/lib')
  })

}
















