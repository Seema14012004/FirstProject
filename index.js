const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');

const app = express();
const port = 4500 || process.env.PORT; //If 4500 not then whatever provided

const users = {};

app.get('/', (req, res) => {
  res.send('Yes its working');
});

const server = http.createServer(app);

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('joined', ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit('userJoined', {user: 'Admin',message: `${users[socket.id]} has joined`}); // Everyone will get a message except the person who joined
    socket.emit('welcome', {user: 'Admin',message: `Welcome to the chat, ${users[socket.id]}`});
  })

  socket.on('message',({message,id})=>{
    io.emit('sendMessage',{user:users[id],message,id});
  })
   
  socket.on('leaveChat', () => {
    const user = users[socket.id];
    delete users[socket.id];
    socket.broadcast.emit('userLeft', {
      user: 'Admin',
      message: `${user} has left`,
    });
    console.log(`${user} left`);
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
