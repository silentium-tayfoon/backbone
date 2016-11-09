
// clear require cache (need for Hot Module Replacement)
//delete require.cache[require.resolve('./../../js_modules/register/register.js')];

var register = require('./../../js_modules/register/register.js');
var register2 = require('./../../js_modules/register/register2.js');

register();
register2();