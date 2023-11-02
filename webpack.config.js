const webpack = require('webpack');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

const config = {
  devtool: 'inline-source-map',
  entry: path.join(__dirname, 'src', 'index.jsx'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    hashFunction: 'sha512'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'test'),
    },
    compress: false,
    port: 1338,
    devMiddleware: {
      index: false, // specify to enable root proxying
    },
    watchFiles: ['./src/App.jsx'],
  },
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   test: /\.(jsx)$/,
      //   exclude: /node_modules/,
      //   use: 'eslint-loader',
      // },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader'],
      },
      {
        test: /\.(png|jp(e*)g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [new ESLintPlugin()],
};

module.exports = config
