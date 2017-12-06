


import Model from './model';

require("!style!css!./style.css");

const control_view = require('html!base/modules/numbers/controls_view.tpl');
const digits_view = require('html!base/modules/numbers/digits_view.tpl');

export default Backbone.View.extend({
	events: {
		'click .generate_js': 'generateDigits',
		'keyup #num_of_cols': 'setWidth'
	},
	initialize: function() {
		this.render();
	},
	el: '#main',
	template: _.template(control_view),
	template_digits: _.template(digits_view),
	model: new Model(),
	render: function () {
		this.$el.append(this.template(this.model.toJSON()));
		this.$loading = $(document).find('#loading');
		this.$digits_dom = this.$el.find('#digits');

		this.$loading.hide();
	},
	generateDigits: function () {
		this.model.getDigits();
		let tpl = this.template_digits(this.model.toJSON());
		this.$digits_dom.empty().append(tpl);
	},
	setWidth: function (e) {
		this.model.set('width', e.target.value);
	}
});