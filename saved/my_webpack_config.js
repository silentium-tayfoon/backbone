// process.env.NODE_ENV - get on run: NODE_ENV=production webpack
// to run scripts in package.json   : npm run development

/* global  __dirname, console, require, module, optimize */

var NODE_ENV = process.env.NODE_ENV || 'development';
var WEBPACK = require('webpack');
var glob = require('glob');
var PATH = require('path');

var entries = glob.sync('./module/**/*.index.js');
var entry_map = {};

console.log(entries);

entries.forEach(function(entry) {
	var path = entry.replace(/[^/]+$/i, '');
	var dir_name = path.match(/[^/]+\/$/i)[0].replace('/', '');

	entry_map[path + dir_name] = entry;
});

console.log(entry_map);

// var entry_map = {
// 		'bundle/reseller_setup': './bundle/reseller_setup_entry_point.js'
// 	};

module.exports = {
	entry: entry_map,
	// {
	// 	'bundle/reseller_setup': './bundle/reseller_setup_entry_point.js'
	// },
	output: {
		path: './',
		publicPath: '/module/',
		filename: '[name].bundle.js',
		chunkFilename: '[name].bundle.js'
	},
	watch: NODE_ENV === 'development',
	watchOptions: {
		aggregateTimeout: 50
	},
	devtool: (NODE_ENV === 'development') ? 'source-map' : '',
	plugins: [
		new WEBPACK.DefinePlugin({
			NODE_ENV: JSON.stringify(NODE_ENV)
		})
	],
	resolve: {
		modulesDirectories: ['framework', 'module', 'node_modules'],
		extensions: ['', '.js'],
		alias: {
			root: PATH.resolve(__dirname),
			template_path: '../../../../../system/public_html/reseller/templates/reseller/module/'
		}
	},
	externals: {
		// require("jquery") is external and available
		//  on the global var jQuery
		"jquery": "jQuery"
	}
};

if (NODE_ENV === 'production') {
	module.exports.plugins.push(
		new WEBPACK.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				drop_console: true,
				unsafe: false
			}
		})
	);
}
