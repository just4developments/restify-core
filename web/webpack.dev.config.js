var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        app: './webpack/app.js'
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        loaders: [
            { test: /\.s?css$/, loader: 'style!css!sass'},
            { test: require.resolve('angular'), loader: 'exports?window.angular' },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|assets)/,
                loader: 'babel', // 'babel-loader' is also a valid name to reference
                query: {
                    presets: ['es2015']
                }
            },
            { test: /\.(jpe?g|png|gif|svg)$/i, loader: "url-loader?name=images/[name].[ext]" },
            { test: /\.(ttf|otf|eot|svg|woff2?)(\?[a-z0-9]+)?$/, loader: 'file-loader?name=fonts/[name].[ext]' },
            { test: /\.html$/, loader: 'html-loader' },
            { test: /\.htm$/, loaders: ['file-loader?name=[name].[ext]', 'extract-loader', 'html-loader'] }
        ]
    },
    resolve: {
        modulesDirectories: ['node_modules'],
        alias: {
            angular: "angular/index.js",
            router:  "@angular/router/angular1/angular_1_router.js"
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            "angular": "angular"
        })
    ]
}