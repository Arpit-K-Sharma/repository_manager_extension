const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development', // Change to 'production' when you are ready to build
    entry: {
        popup: './src/index.js',   // Entry point for React
        background: './src/background.js', // Entry point for background.js
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            chunks: ['popup'], // Tells Webpack to inject popup bundle into this file
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/manifest.json', to: 'manifest.json' }, // Copy manifest.json to the dist folder
                { from: 'public/images', to: 'images' }, // Copy icons
            ],
        }),
        new Dotenv(), // Load environment variables from .env
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000,
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
