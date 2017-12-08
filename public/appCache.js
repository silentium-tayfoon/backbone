
self.addEventListener('install', function(event) {
	// инсталляция
	console.log('install', event);
});

self.addEventListener('activate', function(event) {
	// активация
	console.log('activate', event);
});


