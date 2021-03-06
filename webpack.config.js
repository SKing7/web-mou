'use strict';

// Modules
var webpack = require('webpack');
var path = require('path');
var configJson = require('./package.json');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var args = require('yargs').argv;

// parameters
var isProd = args.prod;
var plugins = [];
var entry = {
  index: './app/index.js',
  demo: './app/demoIndex.js',
};


plugins.push(new ExtractTextPlugin("core.build.css"));
if (isProd) {
  plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: false
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  );
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  entry: entry,
  plugins: plugins,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "[name].build.js"
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader")
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file"
    }, {
      test: /\.(woff|woff2)$/,
      loader: "url?prefix=font/&limit=5000"
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=application/octet-stream"
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&mimetype=image/svg+xml"
    }, ]
  },
  devServer: {
    contentBase: 'public',
    inline: true,
    hot: true,
    port: 8081
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  },
}
