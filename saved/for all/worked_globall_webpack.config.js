'use strict';

// process.env.NODE_ENV - get on run: NODE_ENV=development webpack
// process.env.NODE_ENV - get on run: NODE_ENV=production webpack
// to run scripts in package.json   : npm run development

const NODE_ENV = process.env.NODE_ENV || 'production';

const webpack = require('webpack');
const glob = require('glob');
const path = require('path');

const ENTRY_FILES_KEYWORD = 'index';
const OUTPUT_FILES_KEYWORD = 'bundle';
const ENTRIES_DIR = '/scripts';

// Result: {'scripts/crazy/test': ./scripts/crazy/test.index.js}
var ENTRY_MAP = (function() {
	var map = {};

	// Get all scripts as entry point by pattern.
	var entries = glob.sync('.' + ENTRIES_DIR + '/**/*.' + ENTRY_FILES_KEYWORD + '.js');

	entries.forEach(function(entry) {
		// Remove './' and '.index.js' from entry for path.
		// String after last backslash in path is [name] of bundle without keyword.
		// ./scripts/crazy/test.index.js => scripts/crazy/test
		var regexp = new RegExp('\\.\\/|(\\.'+ ENTRY_FILES_KEYWORD + '\\.js)', 'g');
		var path = entry.replace(regexp, '');

		map[path] = entry;
	});

	return map;
}());

module.exports = {
	entry: ENTRY_MAP,
	output: {
		path: './',
		publicPath: ENTRIES_DIR + '/',
		filename: '[name].' + OUTPUT_FILES_KEYWORD + '.js'
	},

	resolve: {
		modulesDirectories: ['framework', 'module', 'node_modules'],
		extensions: ['', '.js'],
		alias: {
			root: path.resolve(__dirname),
			reseller_console_framework: '../../../framework',
			reseller_console_template: '../../../../../../../system/public_html/reseller/templates'
		}
	},

	externals: {
		// require("jquery") is external and available
		//  on the global var jQuery
		"jquery": "jQuery"
	},

	watch: NODE_ENV === 'development',
	watchOptions: {
		aggregateTimeout: 50
	},
	devtool: (NODE_ENV === 'development') ? 'source-map' : '',

	resolveLoader: {
		modulesDirectories: ['node_modules'],
		moduleTemplates: ['*-loader', '*'],
		extensions: ['', '.js']
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