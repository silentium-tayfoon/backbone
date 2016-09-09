var PORT = 8090;
var application_root = __dirname;
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

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

app.use(bodyParser.json()); // need to get json data!

app.use('/public', express.static(application_root + '/public'));
app.use('/frameworks', express.static(application_root + '/frameworks'));

// странная ошибка с промисами, и простое решение
mongoose.Promise = global.Promise;

//подключение к базе данных
mongoose.connect( 'mongodb://localhost/library_database' );

//схема
var UserSchema = new mongoose.Schema({
						first_name: { type: String, required: false },
					    last_name: { type: String, required: false },
						country: { type: String, required: false },
						vehicle1: { type: Boolean, required: false },
						vehicle2: { type: Boolean, required: false },
						gender: { type: String, required: false }
					});

//модели
var UserModel = mongoose.model( 'UserModel', UserSchema );


/* 
	REST-сервер

	url 			HTTP 	Method Operation
	/api/books 		GET 	Считывание массива книг
	/api/books/:id  GET 	Считывание книги с идентификатором :id
	/api/books 		POST 	Добавление новой книги и ее возврат  с добавленным атрибутом :id
	/api/books/:id  PUT 	Обновление книги с идентификатором :id
	/api/books/:id  DELETE 	Удаление книги с идентификатором :id
*/
//получение списка всех книг
app.get( '/api/users', function( request, response ) {

	console.log('Show all users');

	return UserModel.find( function( err, users ) {
		if( !err ) {
			return response.send( users );
		} else {
			return console.log( err );
		}
	}); 
});

//получение одной книги по id
/*
	'/api/users/:id' --> :id --> таким образом мы показываем что эта часть динамическая!
	example: http://localhost:8080/api/users/57c68d39487c445f336df993
*/
app.get( '/api/users/:id', function( request, response ) {

	console.log('Show user with id: ' + request.params.id);

    return UserModel.findById( request.params.id, function( err, user ) {
        if( !err ) {
            return response.send( user );
        } else {
            return console.log( err );
        }
	}); 
});

//добавление новой книги
app.post( '/api/users', function( request, response ) {

	console.log('Add new user');

	var user = new UserModel({
		id: UserModel.length,
		first_name: request.body.first_name,
        last_name: request.body.last_name,
		country: request.body.country,
		vehicle1: request.body.vehicle1,
		vehicle2: request.body.vehicle2,
		gender: request.body.gender
	});
	user.save( function( err ) {
		if( !err ) {
			return console.log( 'New user with id: ' + user.id );
		} else {
			return console.log( err );
		}
	});
	return response.send( user );
});

//Обновление книги
app.put( '/api/users/:id', function( request, response ) {

    console.log( 'Updating user with id: ' + request.params.id );

    return UserModel.findById( request.params.id, function( err, user ) {

    	user.first_name = request.body.first_name,
        user.last_name = request.body.last_name,
		user.country = request.body.country,
		user.vehicle1 = request.body.vehicle1,
		user.vehicle2 = request.body.vehicle2,
		user.gender = request.body.gender

        return user.save( function( err ) {
            if( !err ) {
                console.log( 'Updated with id: ' + request.params.id );
			} else {
                console.log( err );
            }
            return response.send( user );
        });
	}); 
});

//удаление книги
app.delete( '/api/users/:id', function( request, response ) {

	console.log(request.params);
	if(request.params.id){
		console.log( 'Deleting user with id: ' + request.params.id );

		return UserModel.findById( request.params.id, function( err, user ) {
			if(user){
				return user.remove( function( err ) {
					if( !err ) {
						console.log( 'User removed, with id: ' + request.params.id );
						return response.send( '{"id":"' + request.params.id + '"}' ); // '{"id":"' + request.params.id + '"}' // JSON string
					} else {
						console.log( err );
					}
				});
			}else{
				console.log('can\'t find a user');
				return response.send( JSON.stringify( 'error: "no such user "' ) );
			}	 
		});
	}else{
		console.log('no id was prowided!');
	}
	
});

/*
	// REST-сервер
*/

var users = [];

app.get('/', function (req, res) {
  res.sendFile(application_root + '/index.html');
});

app.get( '/api', function( request, response ) {
    response.send( 'Library API is running' );
});

app.get('/register', function (req, res) {
  res.sendFile(application_root + '/register.html');
});

app.get('/register_get_all', function (req, res) {
	var response = {
		status  : true,
		data: users
	};

	res.json(response);

	console.log('/register_get_all /n'+response);
});

app.post('/register', function(req, res){
	console.log(req.body);
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

app.listen(PORT, function () {
	console.log('Example app listening on port '+ PORT +'!');
});