"use strict";

var webpack = require("webpack");

var plugins = [
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  }),
  new webpack.optimize.OccurenceOrderPlugin()
];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

module.exports = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ["babel-loader"]
      }
    ]
  },
  output: {
    library: "redux-api",
    libraryTarget: "umd"
  },
  devtool: "eval-source-map",
  plugins: plugins,
  resolve: {
    extensions: ["", ".js"]
  }
};
