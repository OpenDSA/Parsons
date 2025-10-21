const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/parsons.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'parsons.js',
    library: {
      name: 'Parsons',
      type: 'window',
      export: 'default'
    }
  },
  mode: 'development', // or 'production'
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader', // Optional if using modern JS
      },
      {
        test: /\.m?js$/,
        resolve: { fullySpecified: false }, // allow bare imports
        type: 'javascript/auto'
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.svg$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash][ext]'
        }
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
};
