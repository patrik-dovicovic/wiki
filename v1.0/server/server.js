const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
        cors:{
            origin: '*'
        }
    });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/', 'index.html'));
});

server.listen(80, () => {
  console.log('listening on *:80');
});


// const io = require('socket.io')(5000, {
//     cors: {
//         origin: '*'
//     }
// })

function getActiveRooms() {
    const arr = Array.from(io.sockets.adapter.rooms);
    const filtered = arr.filter(room => !room[1].has(room[0]))
    const res = filtered.map(i => i[0]);
    return res;
}


io.on("connection", socket => {
    socket.on("message-from-react", (value) => {
        // console.log("message from react",value)
        if (value.role === 'I created') {
            if(value.players.length === 1){
                socket.join(value.room)
            }else{
                socket.to(value.room).emit('message-from-nodejs', { to: 'I joined', action: 'newData', message: {game:value.game,players:value.players} })
            }
        }
        if (value.role === 'I joined') {
            if (value.joined === false) {
                if (getActiveRooms().includes(value.room)) {
                    socket.join(value.room)
                    socket.to(value.room).emit('message-from-nodejs', { to: 'I created', action: 'newPlayer', message: value })
                } else {
                    socket.nsp.to(value.socketId).emit('message-from-nodejs', { to: 'I joined', action: 'whyIDidntJoin', message: 'Wrong room id' })
                }
            }
            if(value.game.started === true){
                socket.to(value.room).emit('message-from-nodejs', { to: 'I created', action: 'newData', message: value })
            }

        }

        // console.log(getActiveRooms())
    })
})


