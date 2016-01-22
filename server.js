/**
 * http://usejsdoc.org/
 */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = Number(process.env.PORT || 3700);

server.listen(port, function () {
	console.log('Updated : Server listening at port %d', port);
});

//Routing
app.use('/js',  express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public'));

//Chatroom

//usernames which are currently connected to the chat
var clients=0;
var messages=[];
io.on('connection', function (socket) {
	clients++;
	socket.emit('clients',{clients:clients});
	socket.broadcast.emit('clients',{clients:clients});

	socket.on('disconnect',function(){
		clients--;
		socket.broadcast.emit('clients',{clients:clients});
	});
	

	socket.on('offer',function(data){
		socket.broadcast.emit('offer',data);
	});
	socket.on('candidate',function(data){
		socket.broadcast.emit('candidate',data);
	});
	socket.on('answer',function(data){
		socket.broadcast.emit('answer',data);
	});
});