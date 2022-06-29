import './game.css'

let lastBuffer = ''

export default function Game({ GameData, setGameData, GameDataObj }) {

    const elementClicked = (event) => {
        event.target.removeAttribute('href')
        let title = event.target.getAttribute('title')
        try {
            title = title.replaceAll(' ', '_')
        } catch{}
        if (title !== null) {
            //push to clicked
            GameDataObj.clicked.push(title)

            let content = document.getElementById("content")
            let contentBuffer = document.getElementById("contentBuffer")

            if(lastBuffer === title){
                content.innerHTML = contentBuffer.innerHTML
            }else{
                content.innerHTML = "<h1>Loading!</h1>"
                getNewWikiSite(title,'content')
                lastBuffer = title
            }

            //set clicked
            setGameData(old => ({ ...old, ...{ clicked: GameDataObj.clicked } }))
            const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameDataObj)
            GameData.socket.emit('message-from-react', GameDataWithoutSocket)
        }
    }
    const elementHovered = (event)=>{
        let title = event.target.getAttribute('title')
        try {
            title = title.replaceAll(' ', '_')
        } catch{}

        if (title !== null) {
            if(lastBuffer !== title){
                getNewWikiSite(title,'contentBuffer')
            }
        }
    }
    function getNewWikiSite(title,destination) {
        title = title.replace(/\s+/g, '_')

        //set url
        let url = GameData.game.const.contentUrl + title
        fetch(url, { mode: "cors" })
            .then(function (response) { return response.json(); })
            .then((data) => {
                document.getElementById(destination).innerHTML = data['parse'].text['*']
                if(destination === 'contentBuffer'){
                    lastBuffer = title
                }
                removeLinks(destination)
                
            })
    }
    function removeLinks(destination){
        document.getElementById(destination).querySelectorAll("a").forEach((link) => {
            if (link.hasAttribute("href")) {
                if (link.getAttribute("href").startsWith("/wiki/Wikipedia:") ||
                    link.getAttribute("href").startsWith("/wiki/File:") ||
                    link.getAttribute("href").startsWith("/wiki/Help:") ||
                    link.getAttribute("href").startsWith("/wiki/Category:") ||
                    link.getAttribute("href").startsWith("/wiki/Wikt:") ||
                    link.getAttribute("href").startsWith("/wiki/Category:") ||
                    link.getAttribute("href").endsWith("&redlink=1")) {
                    let newElement = document.createElement("span");
                    newElement.innerHTML = link.innerHTML
                    link.parentNode.replaceChild(newElement, link)
                }
            }
        });
    }

    function loadFirstWebsite(){
        if (GameDataObj.clicked.length === 0 && GameDataObj.game.started) {
            console.log("first article")
            getNewWikiSite(GameData.game.startArticle,'content')
        }
    }
    loadFirstWebsite()
    return (
        <div className='game'>

            {GameDataObj.players.map(e => {
                return (
                    <li key={e.id}>{e.clicked[e.clicked.length - 1]}</li>


                )
            })}

            <div id="content" onClick={(event) => elementClicked(event)} onMouseOver={(event)=>elementHovered(event)}></div>
            <div id="contentBuffer" style={{display:"none"}} onClick={(event) => elementClicked(event)}></div>
        </div>
    )
}