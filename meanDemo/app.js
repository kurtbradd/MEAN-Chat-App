
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var socketio = require('socket.io');

var app = express();

//Connect to local MongoDB
var db = mongoose.connection;
db.on('error', console.error);
mongoose.connect('mongodb://localhost/GDG');

//MongoDB Schemas
var chatMessage = new mongoose.Schema({
	username: String,
	message: String
});
var Message = mongoose.model('Message', chatMessage);

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/message', function (req, res) {

	var message = new Message ({
		username: req.body.username,
    	message : req.body.message
    });

    message.save(function (err, saved) {
    	if (err) {
    		res.send(400);
    		return console.log('error saving to db');
    	}
    	res.send(saved);
    	io.sockets.emit('receiveMessage', saved);
    })
});

app.get('/message', function (req, res) {
	Message.find(function (err, allMessages) {
  	if (err) {
  		return res.send(err);
  	};
  	res.send(allMessages);
  })
});

app.get('*', function (req, res) {
	res.sendfile('./public/index.html');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//Start Socket.io
var io = socketio.listen(server);
io.set('log level', 1);

//Socket on connect
io.sockets.on('connection', function (socket) {
  console.log('client connected');
  Message.find(function (err, allMessages) {
  	if (err) {
  		return console.error(err)
  	};
  	socket.emit('pastMessages', allMessages);
  })

});

