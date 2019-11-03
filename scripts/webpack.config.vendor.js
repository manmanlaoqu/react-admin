var path = require("path");
var webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var args = process.argv.splice(2)

module.exports = {
  // mode: "development",
  // 你想要打包的模块的数组,这里往往是一些第三方的包，我们不会去修改这些包的内容
  //vue/dist/vue.esm.js
  entry: {
    vendor: [
      "react",
      "redux",
      "react-redux",
      "react-router-dom",
      "antd",
      "antd/lib/layout",
      "antd/lib/row",
      "antd/lib/col",
      "antd/lib/table",
      "antd/lib/input",
      "antd/lib/select",
      "antd/lib/radio",
      "antd/lib/switch",
      "antd/lib/checkbox",
      "antd/lib/card",
      "antd/lib/avatar",
      "antd/lib/icon",
      // path.resolve("./src/lib/utils"),
      // path.resolve("./src/Components/lib/table/FetchTable"),  //如果需要引入自定义插件的话
    ]
  },
  output: {
    path: path.join(__dirname, "../dll/js"), // 打包后文件输出的位置
    filename: "[name].dll.js",
    library: "[name]_library"
    // vendor.dll.js中暴露出的全局变量名。
    // 主要是给DllPlugin中的name使用，
    // 故这里需要和webpack.DllPlugin中的`name: '[name]_library',`保持一致。
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, "../dll/", "[name]-manifest.json"),
      name: "[name]_library",
      context: __dirname
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      parallel: true
    })
  ]
};
