export default Backbone.Model.extend({
	defaults: {
		digits: [],
		width: 3
	},
	getDigits: function () {
		let for_render = [];
		let row_array = [];
		let row_count = 0;

		let generated_random = this.generateRandom(0, 100);

		for (let i = 0; i< generated_random.length; i++) {

			generated_random[i] = this.fix100(generated_random[i]);

			generated_random[i] = this.fixZero(generated_random[i]);

			if (row_count < this.get('width')) {

				row_array.push(generated_random[i]);
				row_count++;
			} else {

				for_render.push(row_array);

				row_count = 1;
				row_array = [];
				row_array.push(generated_random[i]);

			}
		}
		this.set('digits', for_render);
	},

	fixZero: function (digit) {

		let add_digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

		let changed = _.find(add_digits, (d) => {
				return d == digit;
		});

		return (changed) ? '0' + changed : digit;
	},
	fix100: function (digit) {
		return (digit != 100) ? digit : '00';
	},
	generateRandom: function(min, max, numOfSwaps){
		let size = (max-min) + 1;
		numOfSwaps = numOfSwaps || size;
		let arr = Array.apply(null, Array(size));

		for(let i = 0, j = min; i < size & j <= max; i++, j++) {
			arr[i] = j;
		}

		for(let i = 0; i < numOfSwaps; i++) {
			let idx1 = Math.round(Math.random() * (size - 1));
			let idx2 = Math.round(Math.random() * (size - 1));

			let temp = arr[idx1];
			arr[idx1] = arr[idx2];
			arr[idx2] = temp;
		}

		return arr;
	}
});