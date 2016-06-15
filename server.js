var express = require('express');
var bodyParser = require('body-parser');


var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(bodyParser.json()); //seems no needed

app.use('/public', express.static(__dirname + '/public'));
app.use('/frameworks', express.static(__dirname + '/frameworks'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/register', function (req, res) {
  res.sendFile(__dirname + '/register.html');
});

app.post('/register', function(req, res){

	var post_data = {
		country: req.body.country_value,
		state: req.body.state_value,
		first_name: req.body.first_name,
		last_name: req.body.last_name
	};

	var response = {
	    status  : true,
	    data: post_data
	};

	res.json(response);

});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});