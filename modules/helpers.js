let showHideBlock = {
	id_list: ['main', 'help'],
	$dom_list: {},
	hide_class: '_hide',
	init: function ($parent_dom) {
		this.id_list.forEach((id_element) => {
			let founded_dom = $parent_dom.find('#' + id_element);
			if (founded_dom.length > 0) {
				this.$dom_list[id_element] = founded_dom;
			}
		});
	},
	show: function (id_to_show) {
		for (let element in this.$dom_list) {
			if (element === id_to_show) {
				this.$dom_list[element].removeClass(this.hide_class);
			} else {
				this.$dom_list[element].addClass(this.hide_class);
			}
		}
	},
	run_trigger: null,
	cancel: function () {
		this.run_trigger();
		this.show('name_servers_show');
	}
};

export {showHideBlock};