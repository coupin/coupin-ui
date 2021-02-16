const path = require('path');
const spawnSync = require('child_process').spawnSync;

const ROOT = path.resolve(__dirname, '..', '..');

const rules = ENV => {
  const environmentRules = require(path.resolve(__dirname, ENV));

  return [
    ...environmentRules,
    {
      test: /\.(js)$/,
      exclude: /node_modules/,
      include: path.resolve(ROOT, 'app'),
      enforce: 'pre',
      use: [
        {
          loader: 'eslint-loader',
          options: {
            configFile: path.resolve(ROOT, 'app', '.eslintrc.js'),
          }
        }
      ]
    },
    {
      test: /\.js$/,
      exclude: [path.resolve(ROOT, 'node_modules')],
      use: [
        'ng-annotate-loader?ngAnnotate=ng-annotate-patched',
        'babel-loader'
      ]
    },
    {
      test: /.html$/, loader: 'html-loader'
    },
    {
      test: /\.(jpe?g|png|gif|ico|mp3)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            hash: 'sha512',
            digest: 'hex',
            name: '[name]-[hash].[ext]'
          }
        }
      ]
    },
    {
      test: /\.(eot|ttf|woff|woff2)$/,
      use: [
        {
          loader: 'file-loader',
          // options: {
          //   name: 'public/fonts/[name].[ext]'
          // }
        }
      ]
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: 'svg-url-loader',
          options: {
            limit: 10000,
          },
        },
      ],
    },
  ];
};

module.exports = rules;
