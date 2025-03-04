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

const sendMessage = (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Emit message via Socket.IO (needs access to io instance)
    req.app.get("io").emit("message", message);

    res.json({ success: true, message });
};

module.exports = {
    sendMessage
};