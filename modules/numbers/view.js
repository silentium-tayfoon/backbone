
import Model from './model';

require("!style!css!./style.css");

const numbers_tpl = require('html!base/modules/numbers/view.tpl');
console.log('here');
export default Backbone.View.extend({
	events: {
		//'click .update_js': 'update'
	},
	initialize: function() {

		// this.model.on('sync', function() {
		// 	self.render(false);
		// });

		this.render();

	},
	el: '#main',
	template: _.template(numbers_tpl),
	model: new Model(),
	render: function () {
		this.$el.append(this.template({}));
	}
});