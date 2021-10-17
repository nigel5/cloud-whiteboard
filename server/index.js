const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const uuidv4 = require('uuid').v4;

const port = process.env.PORT || 3001;

let roomData = {}; // We can have this is memcached

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    let joinedRoomId;
    let nickname = socket.handshake.query.nickname || "Nickname";
    let cursorColor = socket.handshake.query.cursorColor || "#000000";
    let mousePos = { x: 0, y: 0 };

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
            mousePos,
        };

        // Emit to room members to create the cursor
        socket.to(joinedRoomId).emit("user joined", {
            [socket.id]: {
                nickname,
                cursorColor,
                mousePos,
            }
        });
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
                    mousePos,
                },
            },
        };
    }

    socket.emit('room joined', joinedRoomId);

    // Emit inital mouse cursor
    socket.to(joinedRoomId).emit('mouse move', roomData[joinedRoomId]["users"]);

    socket.on('disconnect', () => {
        socket.to(joinedRoomId).emit("user left", {
            [socket.id]: {
                nickname,
            }
        });

        delete roomData[joinedRoomId]["users"][socket.id];
        // Remit the mouse data to get clients to remove the cursor of this socket that just disconnected
        socket.to(joinedRoomId).emit('mouse move', roomData[joinedRoomId]["users"]);
    });

    socket.on('draw', (msg) => {
        roomData[joinedRoomId]["drawEvents"].push(msg);
        socket.to(joinedRoomId).emit('draw', msg);
    });

    socket.on("mouse move", (msg) => {
        roomData[joinedRoomId]["users"][socket.id]["mousePos"] = {
            x: msg.x,
            y: msg.y,
        };
        socket.to(joinedRoomId).emit('mouse move', roomData[joinedRoomId]["users"]);
    });

    socket.on("request draw events", () => {
    });
});


http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});