import './game.css'

export default function Game({ GameData, setGameData, GameDataObj }) {
    return (
        <div className='game'>
            <h1>game role: {GameData.role}</h1>
            <h1>username: {GameData.username}</h1>
            <h1 onClick={() => { navigator.clipboard.writeText(GameData.room) }} style={{ cursor: "pointer" }}>game room: {GameData.room}</h1>

        </div>
    )
}