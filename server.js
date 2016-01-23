/**
 * http://usejsdoc.org/
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = Number(process.env.PORT || 3700);

server.listen(port, function() {
	console.log('Updated : Server listening at port %d', port);
});

// Routing
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));

// var clients = 0;
var usernames = [];


io.on('connection', function(socket) {
	var isConnected = false;

	socket.on('disconnect', function() {
		if (isConnected) {
			delete usernames[socket.username];
		}
		socket.leave(socket.username);
		socket.clients--;
		socket.broadcast.to(socket.username).emit('clients', {
			clients : socket.clients
		});
		
	});

	socket.on('username', function(data) {
		socket.username = data;
		socket.join(data);
		isConnected = true;
		usernames[socket.clients] = data;
		var room = io.sockets.adapter.rooms[data];
		
		
		 socket.clients = room.length;
		socket.emit('clients', {
			clients : socket.clients
		});
		socket.broadcast.to(socket.username).emit('clients', {
			clients : socket.clients
		});
	});
	socket.on('offer', function(data) {
		socket.broadcast.to(socket.username).emit('offer', data);
	});
	socket.on('candidate', function(data) {
		socket.broadcast.to(socket.username).emit('candidate', data);
	});
	socket.on('answer', function(data) {
		socket.broadcast.to(socket.username).emit('answer', data);
	});
});