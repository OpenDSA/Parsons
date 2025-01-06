const path = require('path'), webpack = require('webpack');

module.exports = {
    entry: './src/lib/parsons.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode:'development',
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/i,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                strictMath: true,
                            },
                        },
                    },
                ],
            },
        ]
    }
    ,
    plugins:[ new webpack.ProvidePlugin({
        restructured:"restructured"
    })]
};