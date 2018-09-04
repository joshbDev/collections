const base = require('./webpack.config');
const webpack = require('webpack');
const plugins = base.plugins;
const config = Object.assign(base, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.UglifyJsPlugin(),
    ...plugins,
  ],
});

module.exports = config;
