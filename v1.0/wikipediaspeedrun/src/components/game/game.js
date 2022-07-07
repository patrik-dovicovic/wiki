import './game.css'
import './wikipediaStyle.css'
import { v4 as uniqueId } from 'uuid';
import React, { Component }  from 'react';
let lastBuffer = ''

export default function Game({ GameData, setGameData, GameDataObj }) {

    const elementClicked = (event) => {
        event.target.removeAttribute('href')
        event.target.style.color = 'black'
        event.target.style.textDecoration = 'none'
        // event.target.style.cursor = 'no-drop'
        let title = event.target.getAttribute('title')
        try {
            title = title.replaceAll(' ', '_')
        } catch { }
        if (title !== null) {
            //push to clicked
            GameDataObj.clicked.push(title)

            let content = document.getElementById("content")
            let contentBuffer = document.getElementById("contentBuffer")

            if (lastBuffer === title) {
                content.innerHTML = contentBuffer.innerHTML
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            } else {
                content.innerHTML = `<h1 class='loading'>Loading!</h1>`
                getNewWikiSite(title, 'content')
                lastBuffer = title
            }

            //set clicked
            setGameData(old => ({ ...old, ...{ clicked: GameDataObj.clicked } }))
            const GameDataWithoutSocket = (({ socket, ...o }) => o)(GameDataObj)
            GameData.socket.emit('message-from-react', GameDataWithoutSocket)
        }
    }
    const elementHovered = (event) => {
        let title = event.target.getAttribute('title')
        try {
            title = title.replaceAll(' ', '_')
        } catch { }

        if (title !== null) {
            if (lastBuffer !== title) {
                getNewWikiSite(title, 'contentBuffer')
            }
        }
    }
    function getNewWikiSite(title, destination) {
        title = title.replace(/\s+/g, '_')

        //set url
        let url = GameData.game.const.contentUrl + title
        fetch(url, { mode: "cors" })
            .then(function (response) { return response.json(); })
            .then((data) => {
                document.getElementById(destination).innerHTML = data['parse'].text['*']
                if (destination === 'contentBuffer') {
                    lastBuffer = title
                }
                removeLinks(destination)

            })
    }
    function removeLinks(destination) {
        document.getElementById(destination).querySelectorAll("a").forEach((link) => {
            if (link.hasAttribute("href")) {
                if (link.getAttribute("href").startsWith("/wiki/Wikipedia:") ||
                    link.getAttribute("href").startsWith("/wiki/File:") ||
                    link.getAttribute("href").startsWith("/wiki/Help:") ||
                    link.getAttribute("href").startsWith("/wiki/Category:") ||
                    link.getAttribute("href").startsWith("/wiki/Wikt:") ||
                    link.getAttribute("href").startsWith("/wiki/Category:") ||
                    link.getAttribute("href").startsWith("/wiki/Talk:") ||
                    link.getAttribute("href").startsWith("//upload.wikimedia.org") ||
                    link.getAttribute("href").startsWith("https://en.wiktionary.org/wiki/") ||
                    link.getAttribute("href").startsWith("/w/index.php?") ||
                    link.getAttribute("href").endsWith("&redlink=1")) {
                    let newElement = document.createElement("span");
                    newElement.innerHTML = link.innerHTML
                    link.parentNode.replaceChild(newElement, link)
                }
            }
        });
    }
    function ulscroll() {
        document.getElementById("GL_my_clicks_ul").scroll(0, 1000000)
    }

    function loadFirstWebsite() {
        if (GameDataObj.clicked.length === 0 && GameDataObj.game.started) {
            console.log("first article")
            getNewWikiSite(GameData.game.startArticle, 'content')
        }
    }
    loadFirstWebsite()
    return (
        <div className='game'>
            <div className='GameLeft'>
                <div className='GL_logo_text'>
                    <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png' alt="wikipedialogo"></img>
                    <p>Wikipedia speedrun</p>
                </div>
                <div className='GL_my_clicks'>
                    <div className='GL_my_clicksContainer'>
                        <span>{GameData.game.startArticle}</span>
                        <ul id='GL_my_clicks_ul' >
                            {GameData.clicked.length === 0 &&
                                <li key="first">START &#8593;&#8595; END&#32;&#32;&#32;&#32;</li>
                            }
                            {GameData.clicked.map(e =>
                                (<li key={e}>{e.replaceAll("_", " ")}</li>),

                            )}
                        </ul>
                        <span>{GameData.game.finishArticle}</span>
                    </div>
                </div>
                {GameData.clicked.length > 0 &&
                    ulscroll()
                }
                <div className='otherPlayers'>
                    <div className='otherPlayersContainer'>
                        <ul id='otherPlayers_UL'>
                            {GameData.players.map(e =>
                                <li key={e.username}>
                                    <div className='OP_img'><img src='https://www.011global.com/Account/Slices/user-anonymous.png' alt=''></img></div>
                                    <div className='OP_next_img'>
                                        <div className="OP_otherplayers_top">
                                            {e.id === GameData.id && <div className='OP_username'>{e.username} <span> (You)</span></div>}
                                            {e.id !== GameData.id && <div className='OP_username'>{e.username}</div>}
                                            <div className='OP_standing'>1</div>
                                        </div>
                                        <div className="OP_otherplayers_bottom">
                                            <div className='OP_clickCounte'><span>{e.clicked.length}</span></div>
                                            {e.clicked.length === 0 &&
                                                <div className='OP_lastClick' style={{ fontStyle: 'italic' }} data-text={"no click was captured"}>no click was captured</div>
                                            }
                                            {e.clicked.length > 0 &&
                                                <div className='OP_lastClick' data-text={e.clicked[e.clicked.length - 1].replaceAll("_", " ")}>{e.clicked[e.clicked.length - 1].replaceAll("_", " ")}</div>
                                            }
                                        </div>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

            </div>
            <div className='GameRight'>
                {GameData.winner === '' &&
                    <>
                        <div className='GameRightTitle'>
                            {GameData.clicked.length === 0 &&
                                <>
                                    <div className='titleWiki'>{GameData.game.startArticle.replaceAll('_', " ")}</div>
                                </>
                            }
                            {GameData.clicked.length > 0 &&
                                <>
                                    <div className='titleWiki'>{GameData.clicked[GameData.clicked.length - 1].replaceAll('_', " ")}</div>
                                </>
                            }
                        </div>
                        <div id="content" onClick={(event) => elementClicked(event)} onMouseOver={(event) => elementHovered(event)}></div>
                        <div id="contentBuffer" style={{ display: "none" }} onClick={(event) => elementClicked(event)}></div>
                    </>
                }
                {GameData.winner !== '' &&
                    <>
                        <div>winner: {GameData.winner.username}</div>
                        <div>winning road: 
                            <li >{GameData.game.startArticle}</li>
                            {GameData.winner.clicked.map(e=>
                                <li key={uniqueId()}>{e}</li>
                            )}</div>
                    </>
                }
            </div>

        </div >
    )
}