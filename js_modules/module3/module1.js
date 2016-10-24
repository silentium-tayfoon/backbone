

var $ = require('./../../frameworks/jquery.js');
var module_tpl = require('html!./../../tpl/module3.tpl');

module.exports = function(){

	console.log('JQUERY = '+$.fn.jquery);
	$('a');
	console.log(module_tpl);

	
};