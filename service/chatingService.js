// socket.js
const { Server } = require('socket.io');
const User = require('../model/user');
const Message = require('../model/message');
// const privateChatServer = require('socket.io').Server;

exports.setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('++++++++++++ Client connected:', socket.id, ' ++++++++++++');

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`Client ${socket.id} joined room ${room}`);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log(`Client ${socket.id} left room ${room}`);
        });

        socket.on('message', ({ room, message }) => {
            console.log(`Message from ${socket.id} in room ${room}: ${message}`);
            io.to(room).emit('message', { sender: socket.id, message: 'Message from backend' });
        });

        //+++++++++++++++++++++++++++++++++ Private chat ++++++++++++++++++++++++++++++

        // Join a private room
        socket.on('joinPrivateRoom', ({ sender, receiver }) => {
            // const room = [user1, user2].sort().join('_');
            const room = [sender, receiver].sort().join('_');
            socket.join(room);
            console.log(`Client ${socket.id} joined private room ${room}`);
        });

        // Send a private message
        // socket.on('privateMessage', ({ user1, user2, message }) => {
        socket.on('privateMessage', async({ sender, receiver, message }) => {
            const room = [sender, receiver].sort().join('_');

            const senderUser = User.findById(sender);
            const receiverUser = User.findById(receiver);

            const newMessage = new Message({ senderUserId: sender, receiverUserId: receiver, room, message });

            await newMessage.save();
            console.log("newMessage: ", newMessage);
            

            console.log(`Message from ${socket.id} in room ${room}: ${message}`);
            io.to(room).emit('privateMessage', { sender: socket.id, message: 'Message from backend for private chat' });
        });

        //+++++++++++++++++++++++++++++++++ Private chat ++++++++++++++++++++++++++++++

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};


//private chat
exports.setupSocketPrivate = (server) => {
    const io = new Server(server, {
    // const io = new privateChatServer(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('**************** Client connected:', socket.id, ' ****************');

        // Join a private room
        socket.on('joinPrivateRoom', ({ user1, user2 }) => {
            const room = [user1, user2].sort().join('_');
            socket.join(room);
            console.log(`Client ${socket.id} joined private room ${room}`);
        });

        // Send a private message
        socket.on('privateMessage', ({ user1, user2, message }) => {
            const room = [user1, user2].sort().join('_');
            console.log(`Message from ${socket.id} in room ${room}: ${message}`);
            // io.to(room).emit('privateMessage', { sender: socket.id, message });
            io.to(room).emit('privateMessage', { sender: socket.id, message: 'Message from backend for private chat' });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

