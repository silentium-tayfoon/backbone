
import {NumberModel, NumberParameters} from 'base/modules/numbers/main_model';

const additional_func = {
	defaults: {
		digits: [],
		width: 1
	},
	getDigits: function () {
		let for_render = [];
		let row_array = [];
		let row_count = 0;

		let generated = new Array(102); // 102 to get 00 included in list

		for (let i = 0; i< generated.length; i++) {

			generated[i] = i;

			generated[i] = this.fix100(generated[i]);

			generated[i] = this.fixZero(generated[i]);

			if (row_count < this.get('width')) {

				row_array.push(generated[i]);
				row_count++;
			} else {

				for_render.push(row_array);

				row_count = 1;
				row_array = [];
				row_array.push(generated[i]);

			}
		}
		this.set('digits', for_render);
	}
};

const NumberModelExtended = _.extend(NumberParameters, additional_func);

const HelpModel = Backbone.Model.extend(NumberModelExtended);

export {HelpModel};