import './App.css';
import { v4 as uniqueId } from 'uuid';
import Menu from './components/menu/menu'
import Game from './components/game/game'
import { useState, useEffect } from 'react';
const io = require("socket.io-client");

const socket = io("http://localhost:4000", {});

let GameDataObj = {
  id: uniqueId(),
  socket: socket,
  socketId: "",
  username: "",
  room: "",
  role: "",
  finished: false,
  players: [],
  game: {
    started: false,
    startArticle: '',
    finishArticle: '',
    const: {
      searchUrl: 'https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&format=json&search=',
      contentUrl: 'https://en.wikipedia.org/w/index.php?title=',
      afterContentUrl: '&action=render',
    }
  },
  joined: false,
  creatorID: '',

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
        }
        GameDataObj.players.push(me)
        setGameData(GameDataObj)
        setGameData(old => ({ ...old, ...{ joined: true } }))

      }
      //create object game data withou socket because socket is function
      const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameData)
      GameData.socket.emit('message-from-react', GameDataWithoutSocket)
    }
    // when GameData change and i joined
    if ((GameData.role === 'I joined') && (GameData.room !== '') && (GameData.username !== '') && (GameData.socketId !== '')) {
      const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameData)
      GameData.socket.emit('message-from-react', GameDataWithoutSocket)
    }
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
    <div className="App">
      <Menu GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
      <Game GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
    </div>
  );
}

export default App;