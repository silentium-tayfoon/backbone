/* to run with parameters which are in package.json - in console #: npm run prod */

// process.env.NODE_ENV - get on run: NODE_ENV=some_val webpack
var NODE_ENV = process.env.NODE_ENV || 'dev';
var webpack = require('webpack');
var path = require("path");


//var clearRequire = require('webpack-clear-require');
//clearRequire('react');
//clearRequire(); // all 


module.exports = {
    entry: {
    	'public/register/register': "./public/register/register_entrypoint.js",
		'public/module3/module3': "./public/module3/module3_entrypoint.js"
	}

    ,output: {
		path: './',
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
		// ,new webpack.ProvidePlugin({
		// 	$: "jquery",
		// 	jQuery: "jquery",
		// 	"window.jQuery": "jquery"
		// })
    	//,new webpack.EnvironmentPlugin(OBJ_DATA) // OBJ_DATA=some_val webpack
    ]




    ,resolve: {
    	modulesDirectories: ['frameworks'],
    	extensions: ['', '.js']
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