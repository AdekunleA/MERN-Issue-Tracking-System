const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    app: ['./src/App.jsx'],
    vendor: ['react','react-dom','whatwg-fetch','babel-polyfill','react-router', 'react-router-dom', 'prop-types','query-string',
             'react-bootstrap', 'react-router-bootstrap', 'react-js-pagination',],
  },
  output: {
    path: path.resolve('static'),
    filename: 'app.bundle.js'
  },
  plugins: [],
  
  devtool: 'source-map',
  
  optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: "vendor",
                    name: "vendor",
                    filename: "vendor.bundle.js",
                    chunks: "all"
                }
            }
        }
    },
  
  module: {
  rules: [
    {
      test: /\.jsx$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['react','env']
        }
      }
    }
  ]
},

};
