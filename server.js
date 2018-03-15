var PORT = '8080';
var application_root = __dirname;
var express = require('express');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');


var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json()); // need to get json data!

app.use('/public', express.static(application_root + '/public'));

app.get('/', function (req, res) {
	res.sendFile(application_root + '/index.html');
});

app.get('/clearCache', function (req, res) {
	let model = {
		app_version: 1,
		server_version: 2
	};

	res.json(model);
});

app.get("offline.manifest", function(req, res) {

	let options = {
		root: application_root + '/',
		headers: {
			'Content-Type': 'text/cache-manifest'
		}
	};

	res.sendFile('/public/offline.manifest', options, function (err) {
		if (err) {
			next(err);
		} else {
			console.log('manifest is Sent!');
		}
	});
});

app.listen(PORT, function () {
	console.log('Example app listening on port '+ PORT +'!');
});