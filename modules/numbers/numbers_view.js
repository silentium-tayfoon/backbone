
import {NumberModel} from './numbers_model';

const control_view = require('html!base/modules/numbers/controls_view.tpl');
const digits_view = require('html!base/modules/numbers/digits_view.tpl');

export default Backbone.View.extend({
	events: {
		'click .generate_js': 'generateDigits',
		'click .print_js': 'prepareForPrint',
		'keyup #num_of_cols': 'setWidth'
	},
	initialize: function() {
		this.render();
	},
	el: '#numbers',
	template: _.template(control_view),
	template_digits: _.template(digits_view),
	model: new NumberModel(),
	render: function () {
		this.$el.append(this.template(this.model.toJSON()));
		this.$loading = $(document).find('#loading');
		this.$digits_dom = this.$el.find('#digits');

		this.$loading.hide();

		this.handleClickOnBody();
	},
	generateDigits: function () {
		this.model.getRandomDigits();
		let tpl = this.template_digits(this.model.toJSON());
		this.$digits_dom.empty().append(tpl);

		this.$prompt_dom = this.$digits_dom.find('.prompt');
	},
	prepareForPrint: function() {
		$('.print_hide_js').hide();
	},
	setWidth: function (e) {
		let value = e.target.value || 3;
		this.model.set('width', value);
	},
	isArea: function (clicked_target, searchParent) {

		let $clicked_on = $(clicked_target);
		let $founded_in_parent = $clicked_on.closest(searchParent);

		return ($founded_in_parent.length > 0) ? $clicked_on : false;
	},
	handleClickOnBody: (function(){
		/**
		 * Catch click on body
		 *  and if it was clicked on farbtastic input or colorpicker => do nothing,
		 *  else close all farptastic colorpickers
		 * */
		let runOnce = true;

		return function (drop) {
			//console.log($._data($body[0], "events"));

			let view_link = this;
			let run = drop || runOnce;

			if (run) {

				$(document).click(function(event) {

					let is_clicked_on_digit = view_link.isArea(event.target, '#digits');

					if (is_clicked_on_digit) {
						view_link.showPrompt(is_clicked_on_digit.text());
					}
				});

				runOnce = false;
			}
		};
	})(),
	showPrompt: function (digit_from_dom) {
		let prompt = this.model.getPrompt(digit_from_dom);

		this.$prompt_dom.removeClass('_hide');
		this.$prompt_dom.text(prompt);

		setTimeout(()=>{
			this.$prompt_dom.addClass('_hide');
		}, 1000);
	}
});