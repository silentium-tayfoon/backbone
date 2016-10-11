

// process.env.NODE_ENV - get on run: NODE_ENV=some_val webpack
var NODE_ENV = process.env.NODE_ENV || 'development';
var webpack = require('webpack');



//var clearRequire = require('webpack-clear-require');
//clearRequire('react');
//clearRequire(); // all 

module.exports = {
    entry: "./public/register/register_entrypoint.js"

    ,output: {
        filename: "build_register.js",
        path: './public/register',
        library: 'register_var'
    }

    ,watch: false //NODE_ENV == 'development'

    ,watchOptions: {
    	aggregateTimeout: 1000
    }

    ,devtool: NODE_ENV == 'development' ? "source-map" : null

    ,plugins: [
    	new webpack.DefinePlugin({
    		NODE_ENV: JSON.stringify(NODE_ENV)
    	})
    	//,new webpack.EnvironmentPlugin(OBJ_DATA) // OBJ_DATA=some_val webpack
    ]

    ,resolve: {
    	modulesDirectories: ['public', 'tpl'],
    	extensions: ['', '.js']
    }

    // ,module: {

    // 	loaders: [{
	   //  	test: /\.js$/
	   //  	,loader: 'babel'
	   //  }]
    // }

};

if (NODE_ENV == 'production') {
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