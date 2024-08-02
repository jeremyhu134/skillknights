const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();

const server = http.createServer(app,()=>{
    console.log('server created');
});

const io = socketio(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

var playerCount = 0;

var matches = [
    room1 = {
        player1: "none",
        player2: "none"
    },
    room2 = {
        player1: "none",
        player2: "none"
    },
    room3 = {
        player1: "none",
        player2: "none"
    },
    room4 = {
        player1: "none",
        player2: "none"
    },
    room5 = {
        player1: "none",
        player2: "none"
    },
];

function findOtherSocketId(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == socketid){
            return matches[i].player2;
        }else if(matches[i].player2 == socketid){
            return matches[i].player1;
        }
    }
};

function findMatch(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == "none"){
            matches[i].player1 = socketid;
            return "";
        }else if(matches[i].player2 == "none"){
            matches[i].player2 = socketid;
            return "ready";
        }
    }
};

function removePlayer(socketid){
    for(var i = 0; i < matches.length; i++){
        if(matches[i].player1 == socketid || matches[i].player2 == socketid){
            matches[i].player1 = "none";
            matches[i].player2 = "none";
            return;
        }
    }
};

io.on('connection',(socket)=>{
    console.log('a user connected', socket.id);
    socket.on("searchForMatch",()=>{
        var result = findMatch(socket.id);
        if(result == "ready"){
            io.to(socket.id).emit('matchFound');
            io.to(findOtherSocketId(socket.id)).emit('matchFound');
            setTimeout(() => {
                io.to(socket.id).emit('startMatch',"player2");
                io.to(findOtherSocketId(socket.id)).emit('startMatch',"player1");
            }, 3000);
        }
    });

    socket.on('updateMovement', (x,y)=>{   
        io.to(findOtherSocketId(socket.id)).emit('updateMovement', x, y);
    });

    socket.on('updateAnim', (anim,flip)=>{   
        io.to(findOtherSocketId(socket.id)).emit('updateAnim',anim,flip);
    });

    socket.on('damageDealt', (dmg)=>{   
        io.to(findOtherSocketId(socket.id)).emit('takeDamage',dmg);
    });

    socket.on('disconnect',()=>{
        console.log('user disconnected', socket.id);
        io.to(findOtherSocketId(socket.id)).emit('endMatch');
        removePlayer(socket.id);
    });
});

server.listen(PORT,()=>{
    console.log("Server listening...");
});

