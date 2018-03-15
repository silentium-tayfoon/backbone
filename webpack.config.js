/* to run with parameters which are in package.json - in console #: npm run prod */

// process.env.NODE_ENV - get on run: NODE_ENV=some_val webpack
//const NODE_ENV = process.env.NODE_ENV || 'development';
const NODE_ENV = 'prod';
const webpack = require('webpack');
const path = require("path");
const path_list = (NODE_ENV === 'development') ? require('./path_list_development') : require('./path_list_production');

//var clearRequire = require('webpack-clear-require');
//clearRequire('react');
//clearRequire(); // all 

module.exports = {
    entry: {
    	'public': "./public/index_entrypoint.js",
	}

    ,output: {
		path: './public/',
		filename: "[name].bundle.js",
		chunkFilename: "[id].chunk.js"
    }

    ,watch: true //NODE_ENV == 'dev'

    ,watchOptions: {
    	aggregateTimeout: 1000
    }

    ,devtool: "source-map"

    ,plugins: [
    	new webpack.DefinePlugin({
    		NODE_ENV: JSON.stringify(NODE_ENV)
    	})
		,new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
            _: "underscore",
            Backbone: "Backbone"
		})
    	//,new webpack.EnvironmentPlugin(OBJ_DATA) // OBJ_DATA=some_val webpack
    ]

    ,resolve: {
    	modulesDirectories: ['node_modules', 'frameworks'],
    	extensions: ['', '.js'],
        alias: path_list
    }

    ,module: {
        loaders: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname)
                ],
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env', 'stage-0']
                }
            }
        ]
    }

    // ,module: {

    // 	loaders: [{
	   //  	test: /\.js$/
	   //  	,loader: 'babel'
	   //  }]
    // }

};

if (NODE_ENV == 'prod') {
	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				drop_console: true,
				unsafe: false
			}
		})
	)
}
