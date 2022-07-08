import './App.css';
import { v4 as uniqueId } from 'uuid';
import Menu from './components/menu/menu'
import Game from './components/game/game'
import { useState, useEffect } from 'react';
import React, { Component } from 'react';

const io = require("socket.io-client");

// const socket = io.connect("http://localhost:5000", {});
const socket = io.connect("https://wikipedia-speedrun-nodejs.nw.r.appspot.com", {});

let GameDataObj = {
  id: uniqueId(),
  socket: socket,
  socketId: "",
  username: "",
  room: "",
  role: "",
  finished: false,
  players: [],
  clicked: [],
  ready: false,
  game: {
    started: false,
    startArticle: '',
    finishArticle: '',
    creatorSocketID: '',
    const: {
      searchUrl: 'https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&format=json&search=',
      contentUrl: 'https://en.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=text&page=',
    }
  },
  joined: false,
  connected: true,
  lastBuffer: '',
  winner: '',
}


function App() {
  const [GameData, setGameData] = useState(GameDataObj)

  //set socket id to useState
  socket.on('connect', function () {
    setGameData(old => ({ ...old, ...{ socketId: socket.id } }))
  });

  //when GameData change
  useEffect(() => {

    GameDataObj = GameData
    console.log(GameData)
    // when GameData change and i am creator
    if ((GameData.role === 'I created') && (GameData.room !== '') && (GameData.username !== '') && (GameData.socketId !== '')) {
      //push my data to players array
      if ((GameData.players.length) === 0) {
        let me = {
          id: GameData.id,
          socketId: GameData.socketId,
          username: GameData.username,
          room: GameData.room,
          role: GameData.role,
          finished: GameData.finished,
          joined: GameData.joined,
          clicked: GameData.clicked,
          connected: GameData.connected,
          ready: GameData.ready,
        }
        GameDataObj.players.push(me)
        GameDataObj.game.creatorSocketID = GameData.socketId
        setGameData(GameDataObj)
        setGameData(old => ({ ...old, ...{ joined: true } }))

      }
      //create object game data without socket because socket is function
      const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameData)
      GameData.socket.emit('message-from-react', GameDataWithoutSocket)
    }
    // when GameData change and i joined
    if ((GameData.role === 'I joined') && (GameData.room !== '') && (GameData.username !== '') && (GameData.socketId !== '') && (GameData.game.started === false)) {
      const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameData)
      GameData.socket.emit('message-from-react', GameDataWithoutSocket)

    }
    //check if someone won
    GameData.players.forEach(player => {
      // console.log(player.clicked[player.clicked.length-1]," ",GameData.game.finishArticle.replaceAll("_"," "),(player.clicked[player.clicked.length-1] === GameData.game.finishArticle.replaceAll("_"," ")))
      if (GameData.winner === '' && player.clicked.length !== 0 && player.clicked[player.clicked.length - 1].replaceAll("_", " ") === GameData.game.finishArticle.replaceAll("_", " ")) {
        setGameData(old => ({ ...old, ...{ winner: player } }))
        console.log("winner: ", player.username)
      }
    });
  }, [GameData]);





  //socket.io messages
  useEffect(() => {
    socket.on("message-from-nodejs", (value) => {
      //new messages for creator
      if (value.to === GameData.role && value.to === "I created") {
        if (value.action === 'newPlayer') {
          let newPlayerObj = {
            id: value.message.id,
            socketId: value.message.socketId,
            username: value.message.username,
            room: value.message.room,
            role: value.message.role,
            finished: value.message.finished,
            joined: value.message.joined,
            clicked: value.message.clicked,
            connected: value.message.connected,
            ready: value.message.ready,
          }
          //check if id was pushed
          let idPushed = false
          GameData.players.forEach(e => {
            if (e.id === value.message.id) {
              idPushed = true
            }
            //change username when duplicate
            //...
          });

          if (!idPushed) {
            GameDataObj.players.push(newPlayerObj)
            let players = GameDataObj.players
            setGameData(old => ({ ...old, ...{ players: players } }))
          }
        }
        if (value.action === 'newData') {
          const index = GameDataObj.players.findIndex(object => {
            return object.id === value.message.id;
          });
          GameDataObj.players[index] = {
            id: value.message.id,
            socketId: value.message.socketId,
            username: value.message.username,
            room: value.message.room,
            role: value.message.role,
            finished: value.message.finished,
            joined: value.message.joined,
            clicked: value.message.clicked,
            connected: value.message.connected,
            ready: value.message.ready,
          }
          let players = GameDataObj.players
          setGameData(old => ({ ...old, ...{ players: players } }))
        }
      }
      //new messages for joined
      if (value.to === GameData.role && value.to === "I joined") {
        //set game/players
        if (value.action === 'newData') {
          GameDataObj.players = value.message.players
          let players = GameDataObj.players
          GameDataObj.game = value.message.game
          let game = GameDataObj.game
          setGameData(old => ({ ...old, ...{ players: players } }))
          setGameData(old => ({ ...old, ...{ game: game } }))
          setGameData(old => ({ ...old, ...{ joined: true } }))
        }

      }
    })

  }, [GameData]);


  return (
    <>
      {window.innerWidth >= 1400 &&
        <div className="App">
          {GameData.game.started &&
            <Game GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
          }
          {!GameData.game.started &&
            <Menu GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
          }
        </div>
      }
      {window.innerWidth < 1400 &&
        <h4 style={{marginLeft:"20px"}}>For better experience please use computer.</h4>
      }
    </>

  );
}

export default App;