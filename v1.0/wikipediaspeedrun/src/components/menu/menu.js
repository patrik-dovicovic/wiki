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


    return (
        <div className='menu'>
            {GameData.role === '' && (
                <>
                    <button onClick={e => setGameData(old => ({ ...old, ...{ role: "I created" } }))}>Create private room</button>
                    <button onClick={e => setGameData(old => ({ ...old, ...{ role: "I joined" } }))}>Join private room</button>
                </>
            )}

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
            



        </div>
    )
}