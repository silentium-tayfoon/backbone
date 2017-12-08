var lib = require("./manifest.js");

lib.mkmanifest({
	filename : "cache"
	,path : "/"
	,version : "01"
	,exclude : ['']
	,network : ['index.html',
		'public/bootstrap.css',
		'public/public.bundle.js']
	,fallback : ['index.html',
		'public/bootstrap.css',
		'public/public.bundle.js']
});