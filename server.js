const express = require('express');
const app = express();
const config = require("./config")
const routes = require("./routes")

var http = require('http');
var server = http.createServer(app);
const socketIo = require('socket.io')(server);

socketIo.set('origins', '*:*');
socketIo.on('connection', async ({socket: any}) => {
	console.log("Client Successfully Connected");
	//socketIo.emit('sequentialTrain', "hello world");
})

routes.setUp(app, express, socketIo )
app.use(express.static(config.appPath().resolve(__dirname, 'client/build')));

server.listen(process.env.PORT || 8082, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});