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
}

module.exports = {
  mode: process.env.NODE_ENV,
  entry: "./src/index",
  output: {
    library: "redux-api",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: process.env.NODE_ENV === "production" ? "redux-api.min.js" : "redux-api.js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    minimize: true
  },
  devtool: "hidden-source-map",
  plugins,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader",
      }
    }]
  },
  resolve: {
    extensions: [".js"]
  }
};
