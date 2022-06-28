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
  game: [
    
  ],
  joined:false,
  creatorID:'',

}



function App() {
  const [GameData, setGameData] = useState(GameDataObj)

  //set socket id to useState
  socket.on('connect', function () {
    setGameData(old => ({ ...old, ...{ socketId: socket.id } }))
  });

  socket.on("message-from-nodejs", (value) => {
    // console.log("new message from nodejs: ",value)
    //messages to joined
    if (value.to === 'I joined' && GameData.role === value.to) {
      //check if room id is correct
      if (value.action === 'whyIDidntJoin') {
        console.log(value.message)
      }
    }
    //messages to creator
    if (value.to === 'I created' && GameData.role === value.to) {
      //new player
      if (value.action === 'newPlayer') {
        let nameIsPushed = false
        GameDataObj.players.forEach(e => {
          if (e.id === value.message.id) {
            nameIsPushed = true
          }
        });
        //if !nameIsPushed than push and change usestate
        if (!nameIsPushed) {

          GameDataObj.players.push(value.message)
          setGameData(GameDataObj)
        }
      }
    }
  })

  useEffect(() => {
    const withoutSocket = (({ socket, ...o }) => o)(GameData)
    GameDataObj = GameData


    if(GameData.role === 'I created'){
      let gamedataPlayersLength = 0
      GameData.players.forEach(e => {
        gamedataPlayersLength++
      });
      // console.log("players: ",gamedataPlayersLength)
      if(gamedataPlayersLength === 0){
        let me = {
          id:GameData.id,
          socketId:GameData.socketId,
          username: GameData.username,
          room: GameData.room,
          role: GameData.role,
          finished:GameData.finished,
          joined:true,
        }
        GameDataObj.players.push(me)
        setGameData(GameDataObj)
      }

      if(gamedataPlayersLength > 0){
        GameData.socket.emit('message-from-react', withoutSocket)
      }
    }
    if(GameData.role === 'I joined'){
      GameData.socket.emit('message-from-react', withoutSocket)
    }
    // console.log(GameData)

    return () => {}
  }, [GameData]);





  return (
    <div className="App">
      <Menu GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
      <Game GameData={GameData} setGameData={setGameData} GameDataObj={GameDataObj} />
    </div>
  );
}

export default App;