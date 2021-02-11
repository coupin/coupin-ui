const path = require('path');
const autoPrefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
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
          postcssOptions: {
            plugins: () => [tailwindcss, autoPrefixer]
          }
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sassOptions: {
            includePaths: [
              path.resolve(ROOT, 'app'),
              path.resolve(ROOT, 'node_modules', 'bootstrap', 'public'),
            ]
          }
        }
      },
    ],
  },
];
