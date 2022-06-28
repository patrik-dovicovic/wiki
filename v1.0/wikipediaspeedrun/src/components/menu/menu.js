import './menu.css'

export default function Menu({ GameData, setGameData, GameDataObj }) {

    const setUsername = (id) => {
        let elem = document.getElementById(id)
        setGameData(old => ({ ...old, ...{ username: elem.value } }))
        if (GameData.room === '' && GameData.role === 'I created') {
            createRoomID()
        }
    }
    const createRoomID = () => {
        let numLength = 4
        let r = Math.floor((Math.random() * ((Math.pow(10, (numLength)) - 1) - (Math.pow(10, numLength - 1))) + (Math.pow(10, numLength - 1))))
        setGameData(old => ({ ...old, ...{ room: r.toString() } }))
    }
    const setRoom = (id) => {
        let elem = document.getElementById(id)
        setGameData(old => ({ ...old, ...{ room: elem.value } }))

    }
    const startGame = () => {
        if (GameData.players.length > 1 && GameData.game.startArticle !== '' && GameData.game.finishArticle !== '') {
            GameDataObj.game.started = true
            setGameData(old => ({ ...old, ...{ game: GameDataObj.game } }))
        }

    }
    function getTop10Titles(value, sf) {
        const changeList = (data, sf) => {

            console.log(data)
            let ul
            let input
            if (sf === 'start') { ul = document.getElementById('startArticleSuggestions'); input = document.getElementById('startArticle') }
            if (sf === 'finish') { ul = document.getElementById('finishArticleSuggestions'); input = document.getElementById('finishArticle') }
            ul.innerHTML = ''
            ul.style.display = 'initial'

            for (let i = 0; i < data.length; i++) {
                let a = document.createElement("DIV");
                a.setAttribute("class", "listDiv")
                a.innerHTML += data[i];
                a.innerHTML += "<input type='hidden' value='" + data[i] + "'>";
                ul.appendChild(a)
                a.addEventListener("click", function (e) {
                    input.value = data[i]
                    ul.innerHTML = ""
                    ul.style.display = 'none'
                    if (sf === "start") { GameDataObj.game.startArticle = data[i]; setGameData(old => ({ ...old, ...{ game: GameDataObj.game } })) }
                    if (sf === "finish") { GameDataObj.game.finishArticle = data[i]; setGameData(old => ({ ...old, ...{ game: GameDataObj.game } })) }
                })
            }
        }

        let url = GameData.game.const.searchUrl + value
        fetch(url)
            .then((response) => response.json())
            .then((data) => changeList(data[1], sf))
    }

    return (
        <div className='menu'>
            {GameData.game.started === false &&
                <>
                    {
                        GameData.role === '' && (
                            <>
                                <button onClick={e => setGameData(old => ({ ...old, ...{ role: "I created" } }))}>Create private room</button>
                                <button onClick={e => setGameData(old => ({ ...old, ...{ role: "I joined" } }))}>Join private room</button>
                            </>
                        )
                    }

                    {(GameData.role === 'I created') && (
                        <>
                            {GameData.username === '' &&
                                <>
                                    <input id="username" type={"text"} placeholder="username" />
                                    <button onClick={e => setUsername("username")}>Submit</button>
                                </>
                            }

                        </>
                    )}

                    {(GameData.role === 'I joined' && GameData.username === '') && (
                        <>
                            {GameData.room === '' &&
                                <>
                                    <input id="room" type={"text"} placeholder="Enter room id" />
                                    <button onClick={e => setRoom("room")}>Submit</button>
                                </>
                            }
                            {(GameData.room !== '' && GameData.username === '') &&
                                <>
                                    <input id="username2" type={"text"} placeholder="Username" />
                                    <button onClick={e => setUsername("username2")}>Submit</button>

                                </>
                            }
                        </>
                    )}
                    {(GameData.role === 'I created' && GameData.username !== '') &&
                        <div>
                            <input id="startArticle" onChange={e => getTop10Titles(e.target.value, 'start')} placeholder="Search start article"></input>
                            <ul id='startArticleSuggestions'></ul>
                            <input id="finishArticle" onChange={e => getTop10Titles(e.target.value, 'finish')} placeholder="Search finish article"></input>
                            <ul id='finishArticleSuggestions'></ul>

                        </div>
                    }

                    <hr></hr>
                    {(GameData.joined === true) &&
                        <>
                            started: {GameData.game.started.toString()}
                            <ul>
                                {GameData.players.map(e =>
                                    <li key={e.id}>{e.username}</li>
                                )}
                            </ul>
                            start article: {GameData.game.startArticle}
                            |
                            finish article: {GameData.game.finishArticle}
                        </>
                    }

                    <h1 onClick={() => { navigator.clipboard.writeText(GameData.room) }} style={{ cursor: "pointer" }}>game room: {GameData.room}</h1>

                    {(GameData.role === 'I created' && GameData.username !== '') &&
                        <button onClick={e => startGame()}>START</button>
                    }
                </>
            }



        </div>
    )
}