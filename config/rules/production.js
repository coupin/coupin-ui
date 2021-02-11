const path = require('path');
const autoPrefixer = require('autoprefixer');
const bourbon = require('bourbon-neat').includePaths;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ROOT = path.resolve(__dirname, '..', '..');

module.exports = [
  {
    test: /\.(css|scss)$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [autoPrefixer]
        }
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: [
            bourbon,
            path.resolve(ROOT, 'app'),
            path.resolve(ROOT, 'node_modules', 'bootstrap', 'public'),
          ]
        }
      },
    ],
  },
];
