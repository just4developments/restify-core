exports = module.exports = {
    clients: {},
    listen(server) {        
        const io = require('socket.io')(server.server);
        io.sockets.on('connection', function (socket) {
            console.log('Web request to');
            socket.emit('connected', undefined);
            socket.on('bind', function (sessionId) {
                clients[sessionId] = socket;
            });
        });
        console.log('Websocket is listening');
    },
    send: (sessionId, data, event) => {
        console.log('Send to web');
        let socket = clients[sessionId];
        if (socket) {
            if (socket.connected) {
                socket.emit(event, JSON.stringify(data));
            } else {
                delete clients[sessionId];
            }
        }
    }
}