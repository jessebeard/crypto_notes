const webpack = require('webpack');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: `${__dirname}/src/index.jsx`,
  output: {
    path: `${__dirname}/dist/`,
    filename: 'bundle.js',
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
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
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
