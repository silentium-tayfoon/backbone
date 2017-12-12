const ClearCacheModel = Backbone.Model.extend({
	// urlRoot: 'http://localhost:8080/',
	urlRoot: 'http://192.168.61.211:8080/',
	url: '/clearCache',
	defaults: {
		app_version: 1, // first set in code
		server_version: 1 // get from server
	},
	initialize: function () {
		this.on('sync', this.compareVersions, this);
	},
	checkVersionOnServer: function () {
		this.fetch({data: {clear_cache: true}});
	},
	compareVersions: function () {
		if (this.get('server_version') > this.get('app_version')) {
			window.location.href = this.preparedUrl();
		}
	},
	preparedUrl: function () {
		let clear_pathname = window.location.pathname.split('#')[0];
		clear_pathname = clear_pathname + '?hash=' + this.generateHash();
		return window.location.origin + clear_pathname;
	},
	generateHash: function () {
		let hash = Date.now() + Math.random();
		return hash.toFixed(0);
	}
});


let cache_model = new  ClearCacheModel();

export {cache_model};