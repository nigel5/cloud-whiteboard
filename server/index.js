const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuidv4 = require('uuid').v4;

const port = process.env.PORT || 3001;

let roomData = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let joinedRoomId;
    let nickname = socket.handshake.query.nickname || "Nickname";
    let cursorColor = socket.handshake.query.cursorColor || "#000000";

    if (socket.handshake.query.join && io.sockets.adapter.rooms.has(socket.handshake.query.join)) {
        /**
         * Existing room
         */
        const joinId = socket.handshake.query.join;
        socket.join(joinId);
        joinedRoomId = joinId;
        console.log("Socket " + socket.id + " joined existing room ", joinedRoomId);
        roomData[joinedRoomId]["users"][socket.id] = {
            nickname,
            cursorColor,
        };

        // Emit to room members to create the cursor
        socket.to(joinedRoomId).emit("user joined", {
            nickname,
            cursorColor
        });
        console.log("joined existing room");
        socket.emit("existing draw data", roomData[joinedRoomId]["drawEvents"]);
    } else {
        /**
         * New room
         */
        const newRoomId = uuidv4().split('-')[0];
        socket.join(newRoomId);
        joinedRoomId = newRoomId;
        console.log("Socket " + socket.id + " joined new room ", newRoomId);
        roomData[joinedRoomId] = {
            drawEvents: [], // Array of JSON Stringified events
            users: {
                [socket.id]: {
                    nickname,
                    cursorColor,
                },
            },
        };
    }

    socket.emit('room joined', joinedRoomId);

    socket.on('disconnect', () => {
        console.log(nickname, "disconneted");
    });

    socket.on('draw', (msg) => {
        roomData[joinedRoomId]["drawEvents"].push(msg);
        socket.to(joinedRoomId).emit('draw', msg);
    });

    socket.on("mouse pos", (msg) => {
        socket.to(joinedRoomId).emit('mouse move', msg);
    });

    socket.on("request draw events", () => {
    });
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});