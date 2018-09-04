const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: [
    `${__dirname }/../src/index.js`,
  ],
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: "bundle-[hash].js",
    publicPath: '/',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: path.resolve(__dirname, "../src/"),
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, "../src/"),
        exclude: /node_modules/,
      }, {
        test: /\.(sass|scss)?$/,
        loader: ExtractTextPlugin.extract({fallback: 'style-loader',
          use: [
            { loader: "css-loader" },
            { loader: "sass-loader" },
          ] }),
      }, {
        test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|svg)/,
        loader: 'file-loader',
      }, {
        test: /\/creator-tape\/.+\.module.css$/,
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[local]__[hash:base64:5]',
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [new CleanPlugin(['dist' ], {
    root: path.resolve(__dirname, '../'),
    verbose: true,
  }), new ExtractTextPlugin('[name]-[hash].css'), new HtmlWebpackPlugin({
    alwaysWriteToDisk: true,
    inject: true,
    template: path.resolve(__dirname, '../src/index.html'),
  }), new HtmlWebpackHarddiskPlugin(),
  new CopyWebpackPlugin([{
    from: 'src/public',
    to: 'public',
  } ]),
  new VueLoaderPlugin(),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules' ],
    extensions: ['.js', '.jsx' ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
  },
};
