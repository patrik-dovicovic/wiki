import './menu.css'
import { useState } from 'react'
import React, { Component }  from 'react';

export default function Menu({ GameData, setGameData, GameDataObj }) {
    const [menuMode, setMenuMode] = useState('initialMenu')
    const [menu_join_create, setMenu_join_create] = useState('Join')
    const [SF_popup, setSF_popup] = useState(false)
    const [POPUP_header, setPOPUP_header] = useState('Start article')

    const createRoomID = () => {
        let numLength = 8
        let r = Math.floor((Math.random() * ((Math.pow(10, (numLength)) - 1) - (Math.pow(10, numLength - 1))) + (Math.pow(10, numLength - 1))))
        setGameData(old => ({ ...old, ...{ room: r.toString() } }))
    }
    const startGame = () => {
        if (GameData.players.length > 1 && GameData.game.startArticle !== '' && GameData.game.finishArticle !== '' && GameData.role === 'I created') {
            GameDataObj.game.started = true
            setGameData(old => ({ ...old, ...{ game: GameDataObj.game } }))
            //set clicked

        }
    }
    function getTop10Titles(value, sf) {
        console.log(value)
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
    function setBackground(count, el, size, newClass) {
        function getRandomNumber(min, max) {
            return Math.random() * (max - min) + min;
        }
        let w = window.innerWidth
        let h = window.innerHeight

        for (let i = 0; i < count; i++) {
            let newElement = document.createElement("div");
            newElement.className += newClass
            newElement.style.top = getRandomNumber(-50, h) + 'px'
            newElement.style.left = getRandomNumber(-50, w) + 'px'
            newElement.style.width = size + 'px'
            newElement.style.height = size + 'px'
            document.getElementById(el).appendChild(newElement)
        }
    }
    function checkboxClicked(event) {
        if (event.target.checked) {
            setMenu_join_create('Create')
            document.getElementById('IM_input_room').style.opacity = '0.3'
            document.getElementById('IM_input_room').style.pointerEvents = 'none'
            document.getElementById('IM_input_room').value = ''

        } else {
            setMenu_join_create('Join')
            document.getElementById('IM_input_room').style.opacity = '1'
            document.getElementById('IM_input_room').style.pointerEvents = 'initial'

        }
    }
    function POPUPcheckboxClicked(event) {
        if (event.target.checked) {
            setPOPUP_header('Finishing article')


        } else {
            setPOPUP_header('Start article')


        }
    }
    function proceedToWaitingRoom() {
        let UsernameElem = document.getElementById("IM_input_username")
        if (UsernameElem.value.length >= 3 && UsernameElem.value.length <= 14) {
            setGameData(old => ({ ...old, ...{ username: UsernameElem.value } }))
            if (menu_join_create === "Create") {

                createRoomID()
                setMenuMode('waitingRoom')
                setGameData(old => ({ ...old, ...{ role: "I created" } }))
            }
            if (menu_join_create === "Join") {
                let RoomElem = document.getElementById("IM_input_room")
                if (!isNaN(RoomElem.value) && RoomElem.value.length >= 4 && RoomElem.value.length <= 16) {
                    setGameData(old => ({ ...old, ...{ room: RoomElem.value } }))
                    setMenuMode('waitingRoom')
                    setGameData(old => ({ ...old, ...{ role: "I joined" } }))

                }


            }
        }
    }
    function PopUp() {
        console.log("clicked")
        setSF_popup(!SF_popup)
        let modal = document.getElementById('startEndArticleModal')
        let popup = document.getElementById('startEndArticlePopUP')
        if (SF_popup) {
            modal.style.opacity = 0
            popup.style.opacity = 0
            modal.style.display = "none"
            popup.style.display = "none"
        } else {
            modal.style.opacity = 0.6
            popup.style.opacity = 1
            modal.style.display = "initial"
            popup.style.display = "initial"
        }

    }
    return (
        <div className='menu'>
            {GameData.game.started === false &&
                <>
                    {menuMode === 'initialMenu' &&
                        <>
                            {/* {setBackground(1500,'IM_wikiBackground',100,'IM_wikiBackground_child')} */}
                            <div id='IM_wikiBackground' ></div>
                            <div className='initialMenu'>
                                <div className='initialMenuContainer'>
                                    <div className='IM_input_container'>
                                        <input type={"text"} id="IM_input_username" placeholder="Username" />
                                    </div>
                                    <div className='IM_input_container'>
                                        <input type={"text"} id="IM_input_room" placeholder="Room ID" />
                                    </div>
                                    <div className='IM_mode_slider'>
                                        <div className='IM_mode_slider_div'>
                                            <input id="IM_mode_slider_checkbox" onChange={e => checkboxClicked(e)} type="checkbox" />
                                            <div className='IM_mode_slider_moving_rect'>
                                                {menu_join_create}
                                            </div>
                                            <div className='IM_mode_slider_text_join'>Join</div>
                                            <div className='IM_mode_slider_text_create'>Create</div>
                                        </div>
                                    </div>
                                    <div className='IM_confirmButton'>
                                        <div onClick={e => proceedToWaitingRoom()}>{menu_join_create}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                    {menuMode === 'waitingRoom' &&
                        <>
                            <div className='waitingRoom'>
                                <div id='startEndArticleModal' onClick={e => PopUp()}></div>
                                <div id='startEndArticlePopUP'>
                                    <div className='POPUP_header'>
                                        <div className='POPUP_header_container'>
                                            <input id="POPUP_header_checkbox" onChange={e => POPUPcheckboxClicked(e)} type="checkbox" />
                                            <div className='POPUP_header_moving_rect'>{POPUP_header}</div>
                                            <div className='POPUP_header_start'>Starting article</div>
                                            <div className='POPUP_header_finish'>Finishing article</div>
                                        </div>
                                    </div>
                                    {POPUP_header === 'Start article' &&
                                        <>
                                            <div className='POPUP_input'>
                                                <input defaultValue={GameData.game.startArticle} id="startArticle" onChange={e => getTop10Titles(e.target.value, 'start')} placeholder="Search start article"></input>
                                            </div>
                                            <div className='POPUP_list'>
                                                <ul id='startArticleSuggestions'></ul>
                                            </div>
                                        </>
                                    }
                                    {POPUP_header === 'Finishing article' &&
                                        <>
                                            <div className='POPUP_input'>
                                                <input defaultValue={GameData.game.finishArticle} id="finishArticle" onChange={e => getTop10Titles(e.target.value, 'finish')} placeholder="Search finish article"></input>
                                            </div>
                                            <div className='POPUP_list'>
                                                <ul id='finishArticleSuggestions'></ul>
                                            </div>
                                        </>
                                    }
                                    <img onClick={e => PopUp()} alt='' src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Black_close_x.svg/1200px-Black_close_x.svg.png'></img>
                                </div>
                                <div className='waitingRoomContainer'>
                                    <div className='WR_players'>
                                        <h1>Players</h1>
                                        <div className='WR_players_container'>
                                            {GameData.players.map(e =>
                                                <li key={e.id}>{e.username}</li>
                                            )}
                                        </div>
                                    </div>
                                    <div className='WR_settings'>
                                        <h1>Settings</h1>
                                        <div className='WR_below_settings'>
                                            <div className='WR_s_left'>
                                                <div className='settings_left_block'>
                                                    <div className='setting_small_name'>
                                                        <strong>Starting article:</strong>
                                                    </div>
                                                    {GameData.game.startArticle === '' ? <h2 style={{ fontSize: '15px',fontStyle:'italic' }}>Starting article is not selected yet</h2> : <h2>{GameData.game.startArticle}</h2>}

                                                    <div className='setting_small_name'>
                                                        <strong>Ending article:</strong>
                                                    </div>
                                                    {GameData.game.finishArticle === '' ? <h2 style={{ fontSize: '15px',fontStyle:'italic' }}>Finishing article is not selected yet</h2> : <h2>{GameData.game.finishArticle}</h2>}
                                                    {GameData.role === 'I created' &&
                                                        <img onClick={e => PopUp()} alt="Change starting or ending article" src='http://cdn.onlinewebfonts.com/svg/img_510908.png'></img>
                                                    }

                                                </div>
                                                <div className='settings_left_block'>
                                                    <p>
                                                        <strong>Language:</strong>
                                                        <select name="language" id="language">
                                                            <option value="english">English</option>
                                                        </select>
                                                    </p>
                                                    <p>
                                                        <strong>Time limit:</strong>
                                                        <select name="LimitTime" id="LimitTime">
                                                            <option value="none">none</option>
                                                            <option value="00:30">00:30</option>
                                                            <option value="01:00">01:00</option>
                                                            <option value="01:30">01:30</option>
                                                            <option value="02:00">02:00</option>
                                                            <option value="02:30">02:30</option>
                                                            <option value="03:00">03:00</option>
                                                            <option value="03:30">03:30</option>
                                                            <option value="04:00">04:00</option>
                                                            <option value="04:30">04:30</option>
                                                            <option value="05:00">05:00</option>
                                                            <option value="05:30">05:30</option>
                                                            <option value="06:00">06:00</option>
                                                            <option value="07:00">07:00</option>
                                                            <option value="08:00">08:00</option>
                                                            <option value="09:00">09:00</option>
                                                            <option value="10:00">10:00</option>
                                                        </select>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='WR_s_right'>
                                                <div className='settings_right_block'></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='BelowWaitingRoomContainer'>
                                    <div className='BWR_left' onClick={() => { navigator.clipboard.writeText(GameData.room) }} style={{ cursor: "pointer" }}>
                                        <h1 className='BWR_left_ClickToCopy'>click to copy</h1>
                                        <h1 className='BWR_left_roomID'>{GameData.room}</h1>

                                        <div className='BWR_room_id_text'>Room ID</div>
                                    </div>
                                    <div className='BWR_right' onClick={e => startGame()} >
                                        START GAME
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </>
            }
        </div>
    )
}

