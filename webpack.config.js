"use strict";

const webpack = require("webpack");
const path = require("path");

const plugins = [
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  );
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      debug: true,
      sourceMap: true,
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

module.exports = {
  entry: "./src/index",
  output: {
    library: "redux-api",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: process.env.NODE_ENV === "production" ? "redux-api.min.js" : "redux-api.js",
    path: path.resolve(__dirname, "dist")
  },

  devtool: "hidden-source-map",
  plugins,
  module: {
    rules: [{
      test: /\.js$/,
      use: ["babel-loader"]
    }]
  },
  resolve: {
    extensions: [".js"]
  }
};
