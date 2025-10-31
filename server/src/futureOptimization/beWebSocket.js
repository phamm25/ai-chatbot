const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('message', 'Welcome to the AI Chat!');

  socket.on('userMessage', async (message) => {
    const response = await getChatGPTResponse(message); // hypothetical function
    socket.emit('assistantResponse', response);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
