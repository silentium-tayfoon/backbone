import {ShowHideBlock, SetActiveLink} from 'base/modules/helpers';

import {cache_model} from 'base/modules/clearCache/clear_cache_model';

const showHideBlockParameters = {
	id_list: ['loading', 'numbers', 'help']
};

let showHideBlock = new ShowHideBlock(showHideBlockParameters);

const activeLinkParameters = {
	links: [],
	activeClass: 'active',
	navigationParent: '#navigation'
};
let setActiveLink = new SetActiveLink(activeLinkParameters);

const Router = Backbone.Router.extend({

	routes: {
		"": "main",    // #main
		"main": "main",    // #main
		"help": "help",  // #help
		"clear": "clearCache"
	},

	main: function() {
		setActiveLink.activate('main');
		showHideBlock.show('numbers');
	},

	help: function() {
		setActiveLink.activate('help');
		showHideBlock.show('help');
	},

	clearCache: function() {
		cache_model.checkVersionOnServer();
	}

});

export {Router};