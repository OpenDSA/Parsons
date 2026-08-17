const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env = {}) => ({
  entry: './src/parsons.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'parsons.js',
    library: {
      name: 'Parsons',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  mode: env.production ? 'production' : 'development',
  // Externalize jQuery when building for Rails (host app provides it).
  // Pass --env standalone to include jQuery in the bundle for testing.
  ...(!env.standalone && {
    externals: {
      jquery: {
        commonjs: 'jquery',
        commonjs2: 'jquery',
        amd: 'jquery',
        root: '$'
      }
    }
  }),
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
          filename: '[name][ext]'
        }
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'parsons.css',
    }),
  ],
});
