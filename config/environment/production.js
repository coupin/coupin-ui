const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (config, ROOT) {
  config.mode = 'production';

  config.devtool = false;

  config.output = {
    filename: '[name]-[hash].js',
    path: path.resolve(ROOT, '_build', 'prod', 'public'),
  };

  config.plugins = [
    ...config.plugins,
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css',
      chunkFilename: '[name]-[hash].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(ROOT, 'app', 'index.html'),
      // favicon: path.resolve(ROOT, 'app', 'favicon-new.png')
    })
  ];

  config.optimization = {
    // occurrenceOrder: true,
    noEmitOnErrors: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: false,
        terserOptions: {
          mangle: false,
        },
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        }
      }
    }
  };

  return config;
};
