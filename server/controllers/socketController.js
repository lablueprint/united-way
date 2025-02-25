// const connect = (req, res) => {
//     let socket_id = [];
//     const io = req.io;
 
//     io.on('connection', socket => {
//         socket_id.push(socket.id);
//         if (socket_id[0] === socket.id) {
//         // Remove the connection listener for any subsequent 
//         // Connections with the same ID
//             io.removeAllListeners('connection'); 
//         }
//         socket.on('hello message', msg => {
//             console.log('just got: ', msg);
//             socket.emit('chat message', 'hi from server');
//         });
//     });
// };

// module.exports = {
//     connect,
// };

// socketController.js
module.exports = (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Listen for a custom event from the client
    socket.on('message', (data) => {
        console.log(`Message from client: ${data}`);
        socket.emit('message', `Server received: ${data}`); // Send back response
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
};