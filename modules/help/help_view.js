
import {HelpModel} from './help_model';

const help_digits_view = require('html!./help.tpl');

export default Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	events: {
		'click .help_navigation_js': 'helpNavigation'
	},
	el: '#help',
	template: _.template(help_digits_view),
	model: new HelpModel(),
	render: function () {
		this.model.getDigits();
		this.$el.append(this.template(this.model.toJSON()));
		this.$prompt_dom = this.$el.find('.prompt');
		this.handleClickOnBody();
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
					let is_clicked_on_digit = view_link.isArea(event.target, '#help');

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

		this.$prompt_dom.text(prompt);
		this.$prompt_dom.removeClass('_hide');
		setTimeout(()=>{
			this.$prompt_dom.addClass('_hide');
		}, 1000);
	},
	helpNavigation: function (el) {
		let total_heigt = document.body.offsetHeight;

		let button_val = el.target.value;
		let scroll = total_heigt * button_val;
			scroll = scroll.toFixed(0);

		window.scrollTo(0, scroll);
	}
});