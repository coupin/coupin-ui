/* eslint-env node */

const rules = require('./rules');

const path = require('path');
const webpackWeb = require('webpack');


const handsontablePlugin = new webpackWeb.ProvidePlugin({
  Handsontable: 'handsontable/dist/handsontable.full.js',
  jQuery: 'jquery',
  $: 'jquery',
  jquery: 'jquery'
});

const ROOT = path.resolve(__dirname, '..');
const ENV = process.env.NODE_ENV || 'development';
const environment = require(path.resolve(__dirname, 'environment/' + ENV));

const config = {
  context: ROOT,
  target: 'web',
  entry: {
    app: path.resolve(ROOT, 'app', 'index.js'),
  },

  // node: {
  //   fs: 'empty',
  //   tls: 'mock'
  // },

  module: {
    noParse: [
      path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.js')
    ],
    rules: rules(ENV),
  },

  // Modules resolution
  resolve: {
    modules: [
      path.resolve(ROOT, 'app'),
      path.resolve(ROOT, 'node_modules')
    ],
    extensions: ['.js']
  },

  plugins: [
    handsontablePlugin,
  ],
};

module.exports = environment(config, ROOT);
