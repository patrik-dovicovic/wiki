const io = require('socket.io')(4000, {
    cors: {
        origin: '*'
    }
})

function getActiveRooms() {
    const arr = Array.from(io.sockets.adapter.rooms);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);
    return res;
}


io.on("connection", socket => {
    socket.on("message-from-react", (value) => {
        console.log("from react: ", value)
        if (value.role === 'I created') {
            socket.join(value.room)
        }
        if (value.role === 'I joined') {
            if (value.joined === false) {
                if (getActiveRooms().includes(value.room)) {
                    let newPlayerObj = {
                        id: value.id,
                        socketId: value.socketId,
                        username: value.username,
                        room: value.room,
                        role: value.role,
                        finished: value.finished,
                        joined:value.joined,
                    }
                    socket.join(value.room)
                    socket.to(value.room).emit('message-from-nodejs', { to: 'I created', action: 'newPlayer', message: newPlayerObj })
                } else {
                    socket.nsp.to(value.socketId).emit('message-from-nodejs', { to: 'I joined', action: 'whyIDidntJoin', message: 'Wrong room id' })
                }
            }

        }

        // console.log(getActiveRooms())
    })
})


