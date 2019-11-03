const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (webpackConfig) {
  webpackConfig.devServer = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  };
  webpackConfig.devtool = "eval";

  //add historyApiFallback, you can change route after deploy
  webpackConfig.devServer = {
    historyApiFallback: true
  };

  //add plugins
  let plugins = webpackConfig.plugins;
  plugins.splice(plugins.length - 1, 0, new BundleAnalyzerPlugin(), new webpack.WatchIgnorePlugin(['node_modules']));

  // add loaderList
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

  Object.assign(webpackConfig.resolve.alias, {
    'images': path.resolve('./src/images'),
    'utils': path.resolve('./src/lib')
  })

  // watch
  webpackConfig.watch = true;
  webpackConfig.watchOptions = {
    ignored: /node_modules/,
    aggregateTimeout: 300,
  }

}

