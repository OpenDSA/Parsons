const path = require('path');

module.exports = {
  entry: './src/parsons.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'parsons.js',
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
        use: ['style-loader', 'css-loader'],
    },
    ],
  },
};
