const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const Uglify = require('uglify-es')
const CleanCSS = require('clean-css')

const { port } = require('./configs/server')
const isDev = process.env.NODE_ENV === 'development'
const publicPath = ''

module.exports = {
    devtool: isDev ? 'cheap-source-map' : 'source-maps',
    entry: {
        'login/index': ['./src/login/index.js'],
        'pack/index': ['./src/pack/index.js']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'dist/'),
        publicPath
    },
    externals: {
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'axios': 'axios',
        'vuex': 'Vuex'
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'root': path.resolve(__dirname),
            'src': path.resolve(__dirname, 'src/')
        }
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
                isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
                {
                    loader: 'sass-resources-loader',
                    options: {
                        resources: path.resolve(__dirname, 'src', 'assets', 'mixin.scss')
                    }
                }
            ]
        }, {
            test: /\.(png|jpe?g|gif)$/,
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
                limit: 1000,
                name: 'static/img/[name].[hash:6].[ext]',
                publicPath
            }
        }]
    },
    devServer: {
        host: '0.0.0.0',
        port,
        hot: true,
        overlay: true,
        historyApiFallback: {
            rewrites: [{
                from: '^/pack',
                to: '/pack.html'
            }, {
                from: '^/',
                to: '/login.html'
            }]
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            publicPath,
            filename: '[name].bundle.css'
        }),
        new CopyPlugin(!isDev && [{
            from: path.resolve(__dirname, 'static'),
            to: 'static',
            ignore: ['*.js', '*.css']
        }, {
            from: path.resolve(__dirname, 'static/**/*.css'),
            to: '',
            transform (content) {
                return new CleanCSS({}).minify(content).styles
            }
        }, {
            from: path.resolve(__dirname, 'static/**/*.js'),
            to: '',
            transform (content) {
                return Uglify.minify(content.toString()).code
            }
        }] || []),
        new HtmlPlugin({
            template: 'ejs-loader!template.html',
            filename: 'login.html',
            inject: true,
            chunks: ['login/index'],
            minify: {
                removeComments: false,
                collapseWhitespace: false
            }
        }),
        new HtmlPlugin({
            template: 'ejs-loader!template.html',
            filename: 'pack.html',
            inject: true,
            chunks: ['pack/index'],
            minify: {
                removeComments: false,
                collapseWhitespace: false
            }
        })
    ]
}
