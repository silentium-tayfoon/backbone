var express = require('express');

var app = express();

app.use('/public', express.static(__dirname + '/public'));
app.use('/frameworks', express.static(__dirname + '/frameworks'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});