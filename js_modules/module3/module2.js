var $ = require('./../../frameworks/jquery.js');
var _ = require('imports?$=jquery!./../../frameworks/underscore.js');
var Backbone = require('imports?$=jquery&_=underscore!./../../frameworks/backbone.js');


var module_tpl = require('html!./../../tpl/module3.tpl');

module.exports = function(){

	console.log('JQUERY = '+$.fn.jquery);
	console.log('underscore = '+_.VERSION);
	console.log('Backbone = '+Backbone.VERSION);

	console.log('MODULE 2');

};