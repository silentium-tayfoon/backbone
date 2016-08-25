var express = require('express');
var bodyParser = require('body-parser');

var foundUser = function(id){
	var found = false;
	for(var i=0; i<users.length; i++){
		if(users[i].id === id){
			found = true;
			break;
		}
	}
	return found;
};


var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(bodyParser.json()); //seems no needed

app.use('/public', express.static(__dirname + '/public'));
app.use('/frameworks', express.static(__dirname + '/frameworks'));

var users = [];

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/register', function (req, res) {
  res.sendFile(__dirname + '/register.html');
});

app.post('/register', function(req, res){

	var post_data = {
		id: users.length,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		country: req.body.country,
		vehicle1: req.body.vehicle1,
		vehicle2: req.body.vehicle2,
		gender: req.body.gender
	};

	if(req.body.id && foundUser(req.body.id)){
		users[req.body.id] = post_data;
	}else{
		users.push(post_data);
	}

	var response = {
	    status  : true,
	    data: post_data
	};

	res.json(response);

	console.log(users);

});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});