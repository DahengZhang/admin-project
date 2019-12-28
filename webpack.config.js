const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlPlugin = require('html-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
    devtool: isDev ? 'cheap-source-map' : 'source-maps',
    entry: './src/index.js',
    output: {
        filename: 'app.js',
        path: path.join(__dirname, 'dist/')
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }, {
            test: /\.vue$/,
            exclude: /node_modules/,
            loader: 'vue-loader'
        }, {
            test: /\.(c|sa|sc)ss$/,
            exclude: /node_modules/,
            use: [
                'vue-style-loader',
                'css-loader',
                'sass-loader'
            ]
        }]
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        hot: true,
        overlay: true,
        historyApiFallback: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin(),
        new HtmlPlugin({
            template: 'template.html',
            inject: true,
            minify: {
                removeComments: false,
                collapseWhitespace: false
            }
        })
    ]
}
