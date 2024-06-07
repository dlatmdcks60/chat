const clickEvent = {
    header_menu_search: (data) => {
        const searchDiv = document.querySelector(".main_search_div");
        if (searchDiv.classList.contains("on")) {
            const hiddenItems = document.querySelectorAll('li.list_info.none');
            document.querySelector(".main_search_div input").value = "";
            hiddenItems.forEach(item => {
                item.classList.remove('none');
            });
            searchDiv.classList.remove("on");
        } else {
            searchDiv.classList.add("on");
            document.querySelector(".main_search_div input").focus();
        }
    },
    header_menu_search_2: (data) => { //리스트 검색
        const hiddenItems = document.querySelectorAll('li.list_info.none');
        hiddenItems.forEach(item => {
            item.classList.remove('none');
        });

        const ulList = data === "list" ? document.querySelector("div.list_friend").querySelectorAll(`li.list_info`) : document.querySelectorAll(`ul li.list_info`);
        const targetSubstring = document.querySelector(".main_search_div input").value;

        for (let i = 0; i < ulList.length; i++) {
            const liElement = ulList[i];
            const userNickElement = liElement.querySelector("span.user_nick");

            if (userNickElement) {
                const userNick = userNickElement.textContent.trim();

                if (!userNick.includes(targetSubstring)) {
                    liElement.classList.add("none");
                }
            }
        }
    },
    search_div_btn: (data) => { //친구추가 검색
        api.post('friend_search', (resData) => {
            if (resData.result === true) {
                document.querySelector("#content .friend_section .search_div ul").style.display = "block";
                if (resData.data.length > 0) {
                    const listItems = resData.data.map(item => `<li><div class="usesr_info"><img src="./image/${item.userProfile}" alt="유저 프로필"><span class="user_nick">${item.userNick}</span></div><button data-click="${item.sid}" class="friend_search_btn">요청</button></li>`).join('');
                    document.querySelector('#content .friend_section .search_div ul').innerHTML = listItems;
                } else {
                    document.querySelector('#content .friend_section .search_div ul').innerHTML = "<span class=\"noneData\">검색 결과가 없습니다.</span>";
                }
            } else {
                alert(resData.msg);
                location.replace(resData.location);
            }
        }, {
            kw: document.querySelector('#content .friend_section .search_div input').value
        });
    },
    friend_search_btn: (data) => { //친구추가 요청
        api.post('friend_search_btn', (resData) => {
            if (resData.result === true) {
                socket.emit("friend_search_btn", resData.data.cryptoId);
                location.reload();
                alert(resData.msg);
            } else {
                alert(resData.msg);
            }
        }, {
            sid: data
        });
    },
    friend_req_btn: (data) => { //친구추가 취소
        api.post('friend_cancle', (resData) => {
            if (resData.result === true) {
                location.reload();
                alert(resData.msg);
            } else {
                alert(resData.msg);
            }
        }, {
            sid: data
        });
    },
    friend_res_btn: (data) => { //친구추가 수락
        api.post('friend_accept', (resData) => {
            if (resData.result === true) {
                location.reload();
                alert(resData.msg);
            } else {
                alert(resData.msg);
            }
        }, {
            sid: data
        });
    },
    menu_btn: (data, e) => { //채팅방 메뉴
        e.stopPropagation(); // prevent the event from bubbling up to the document

        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const posX = e.pageX;
        const posY = e.pageY;
        const menuWidth = chatMenuSlide.offsetWidth;
        const menuHeight = chatMenuSlide.offsetHeight;
        const secMargin = 10;
        let posLeft;
        let posTop;
        
        if (posX - menuWidth - secMargin < 0) {
          posLeft = posX + secMargin;
        } else {
          posLeft = posX - menuWidth - secMargin;
        }
        
        if (posY + menuHeight + secMargin > winHeight) {
          posTop = posY - menuHeight - secMargin;
          if (posTop < secMargin) {
            posTop = secMargin; // Ensure the menu is not off-screen to the top
          }
        } else {
          posTop = posY + secMargin;
        }
        
        chatMenuSlide.style.left = (posLeft - 100) + 'px';
        chatMenuSlide.style.top = posTop + 'px';
        chatMenuSlide.style.display = 'block';
    }
}

function msgUpdate(listData) { //메시지 추가
    for (let i = 0; i < listData.length; i++) {
        const ulList = document.querySelector("#content .chat_msg ul.list li"); //가장 최신데이터 추출
        const li_className = ulList ? Array.from(ulList.classList)[1] : null; //최신데이터의 타입
        const liDateD_recent = ulList ? ulList.getAttribute('data-msgdate') : null;
        const liDateP_recent = ulList ? { //최신데이터의 날짜
            all: liDateD_recent,
            date: liDateD_recent.slice(0, 12),
            md: liDateD_recent.substring(0, 8),
            hm: `${liDateD_recent.slice(8, 10)}:${liDateD_recent.slice(10, 12)}`,
            datetime: `${liDateD_recent.slice(0, 4)}년 ${liDateD_recent.slice(4, 6)}월 ${liDateD_recent.slice(6, 8)}일`
        } : null
        let ul = "";
        let li = "";

        if (i === 0 && !ulList) {
            document.querySelector("#content .chat_msg ul.list").insertAdjacentHTML("afterbegin", msgHTML.datetime(`${listData[0].datetime.slice(0, 4)}년 ${listData[0].datetime.slice(4, 6)}월 ${listData[0].datetime.slice(6, 8)}일`));
        } else {
            if (i !== 0) {
                const previously = listData[i - 1].datetime.substring(0, 8);
                const recent = listData[i].datetime.substring(0, 8);
                if (previously !== recent) {
                    document.querySelector("#content .chat_msg ul.list").insertAdjacentHTML("afterbegin", msgHTML.datetime(`${listData[i].datetime.slice(0, 4)}년 ${listData[i].datetime.slice(4, 6)}월 ${listData[i].datetime.slice(6, 8)}일`));
                }
            }
        }

        if (listData[i].type === li_className) { //최신 데이터가 타입이 같을때
            if (liDateP_recent.date === listData[i].datetime.slice(0, 12)) { //날짜가 같을때 생성된 li태그에 추가
                if (listData[i].type === "mine") {
                    li = msgHTML.mine_li({
                        msgId: listData[i].msgId,
                        date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                        msg: listData[i].msg
                    });
                    ulList.querySelector(".msgList ul").insertAdjacentHTML("beforeend", li);
                } else {
                    li = msgHTML.other_li({
                        msgId: listData[i].msgId,
                        date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                        msg: listData[i].msg
                    });
                    ulList.querySelector(".msgList ul").insertAdjacentHTML("beforeend", li);
                }
            } else { //날짜가 다를때 새로운 li태그 생성
                if (listData[i].type === "mine") { //타입이 다를때 mine 메시지타입으로 새로운 li생성
                    li = msgHTML.mine_li({
                        msgId: listData[i].msgId,
                        date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                        msg: listData[i].msg
                    });
                    ul = msgHTML.mine_ul({
                        date_all: listData[i].datetime,
                        liHTML: li
                    });
                } else { //타입이 다를때 other 메시지타입으로 새로운 li생성
                    li = msgHTML.other_li({
                        msgId: listData[i].msgId,
                        date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                        msg: listData[i].msg
                    });
                    ul = msgHTML.other_ul({
                        date_all: listData[i].datetime,
                        userProfile: listData[i].sender.senderProfile,
                        userNick: listData[i].sender.senderNick,
                        liHTML: li
                    });
                }
                document.querySelector("#content .chat_msg ul.list").insertAdjacentHTML("afterbegin", ul);
            }
        } else { //최신 데이터가 타입이 다를때
            if (listData[i].type === "mine") { //타입이 다를때 mine 메시지타입으로 새로운 li생성
                li = msgHTML.mine_li({
                    msgId: listData[i].msgId,
                    date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                    msg: listData[i].msg
                });
                ul = msgHTML.mine_ul({
                    date_all: listData[i].datetime,
                    liHTML: li
                });
            } else { //타입이 다를때 other 메시지타입으로 새로운 li생성
                li = msgHTML.other_li({
                    msgId: listData[i].msgId,
                    date_hm: `${listData[i].datetime.slice(8, 10)}:${listData[i].datetime.slice(10, 12)}`,
                    msg: listData[i].msg
                });
                ul = msgHTML.other_ul({
                    date_all: listData[i].datetime,
                    userProfile: listData[i].sender.senderProfile,
                    userNick: listData[i].sender.senderNick,
                    liHTML: li
                });
            }
            document.querySelector("#content .chat_msg ul.list").insertAdjacentHTML("afterbegin", ul);
        }
    }
}

const msgHTML = {
    mine_ul: (data) => {
        const html = `
        <li class="msgData mine" data-msgdate="${data.date_all}">
            <div class="msgList">
                <ul>${data.liHTML}</ul>
            </div>
        </li>
        `;
        return html;
    },
    mine_li: (data) => {
        const html = `
        <li data-msgid="${data.msgId}">
            <span class="datetime">${data.date_hm}</span>
            <pre>${data.msg}</pre>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="display: inline; pointer-events: auto;">
                <path d="M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z" style="pointer-events: auto;"></path>
            </svg>
        </li>
        `;
        return html;
    },
    other_ul: (data) => {
        const html = `
        <li class="msgData other" data-msgdate="${data.date_all}">
            <div class="user_info_1">
                <img src="./image/${data.userProfile}" alt="유저 프로필">
            </div>
            <div class="user_info_2">
                <span class="user_nick">${data.userNick}</span>
                <div class="msgList">
                    <ul>${data.liHTML}</ul>
                </div>
            </div>
        </li>
        `;
        return html;
    },
    other_li: (data) => {
        const html = `
        <li data-msgid="${data.msgId}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="display: inline; pointer-events: auto;">
                <path d="M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z" style="pointer-events: auto;"></path>
            </svg>
            <pre>${data.msg}</pre>
            <span class="datetime">${data.date_hm}</span>
        </li>
        `;
        return html;
    },
    datetime: (data) => {
        const html = `
        <span class="showDate">${data}</span>
        `;
        return html;
    }
}