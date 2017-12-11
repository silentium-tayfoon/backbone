class ShowHideBlock {
	constructor (parameters) {
		this.id_list = parameters.id_list || [];
		this.hide_class = parameters.hide_class || '_hide';

		this.$dom_list = {};
		this.init_once = false;
	}

	init () {
		this.id_list.forEach((id_element) => {
			let founded_dom = $(document).find('#' + id_element);
			if (founded_dom.length > 0) {
				this.$dom_list[id_element] = founded_dom;
			}
		});
		this.init_once = true;
	}

	show (id_to_show) {
		if (this.init_once === false) {
			this.init();
		}

		for (let element in this.$dom_list) {
			if (element === id_to_show) {
				this.$dom_list[element].removeClass(this.hide_class);
			} else {
				this.$dom_list[element].addClass(this.hide_class);
			}
		}
	}
}

class SetActiveLink {
	constructor (parameters) {

		this.links = parameters.links;
		this.activeClass = 'active' || parameters.activeClass;

		this.$navigationParentDom = $(document).find(parameters.navigationParent);
		this.$linksDom = this.$navigationParentDom.find('a');
	}

	activate (link_name) {

		for (let i=0; i < this.$linksDom.length; i++) {

			let $link = $(this.$linksDom[i]);
			let link_href = $link.attr('href').split('#')[1];

			if (link_name == link_href) {
				$link.addClass(this.activeClass);
			} else {
				$link.removeClass(this.activeClass);
			}
		}
	}
}

export {ShowHideBlock, SetActiveLink};