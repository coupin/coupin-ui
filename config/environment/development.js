const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const dotEnv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getIndexTemplate = ROOT => {
  dotEnv.config({path: path.resolve(ROOT, '.env')});

  return fs
    .readFileSync(path.resolve(ROOT, 'app', 'index.html'), 'utf8')
    .replace(/\$API_URL/g, process.env.API_URL)
};

module.exports = function (config, ROOT) {
  config.mode = 'development';

  config.devtool = 'eval-source-map';

  config.entry = {
    app: [
      'webpack/hot/only-dev-server',
      config.entry.app,
    ],
  };

  config.output = {
    filename: '[name].js',
    path: path.resolve(ROOT, '_build', 'dev', 'public'),
    publicPath: '/',
  };

  config.plugins = [
    ...config.plugins,
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      templateContent: getIndexTemplate(ROOT),
      // favicon: path.resolve(ROOT, 'app', 'favicon-new.png'),
    }),
  ];

  config.devServer = {
    contentBase: path.resolve(ROOT, '_build', 'dev', 'public'),
    publicPath: '/',
    compress: true,
    port: process.env.PORT,
    hot: true,
    host: 'localhost',
    historyApiFallback: true,
  };

  config.optimization = {
    minimize: false,
    // occurrenceOrder: false,
    noEmitOnErrors: true,
  };

  return config;
};
