const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuidv4 = require('uuid').v4;

const port = process.env.PORT || 3001;

let roomToData = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    const id = socket.id;
    let joinedRoomId;
    let nickname = socket.handshake.query.nickname || "Nickname";

    if (socket.handshake.query.join && io.sockets.adapter.rooms.has(socket.handshake.query.join)) {
        const joinId = socket.handshake.query.join;
        socket.join(joinId);
        joinedRoomId = joinId;
        console.log("Socket " + id + " joined existing room ", joinedRoomId, socket.handshake.query);
    } else {
        const newRoomId = uuidv4().split('-')[0];
        socket.join(newRoomId);
        joinedRoomId = newRoomId;
        console.log("Socket " + id + " joined new room ", newRoomId, socket.handshake.query);
    }

    socket.emit('room joined', joinedRoomId);

    socket.on('disconnect', () => {
        console.log(nickname, "disconneted");
    });

    socket.on('draw', (msg) => {
        socket.to(joinedRoomId).emit('draw', msg);
    });

    socket.on("mouse pos", (msg) => {
        socket.to(joinedRoomId).emit('mouse move', msg);
    })
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});