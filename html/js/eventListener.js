function eventListener(pageData) {
    api.post('footerCount_headerDot', (resData) => {
        if (resData.result) {
            document.querySelector("#footer div.menu_chatlist span.count").textContent = resData.count;
            if (resData.count > 0) document.querySelector("#footer div.menu_chatlist span.count").classList.add("on");
            if (resData.count <= 0) document.querySelector("#footer div.menu_chatlist span.count").classList.contains('on') ? document.querySelector("#footer div.menu_chatlist span.count").classList.remove('on') : null
            if (resData.isResFriend && pageData.page_en !== "chatroom") document.querySelector(".header_menu_friend .notification-dot").classList.add("on");
        } else {
            alert(resData.msg);
        }
    });

    if (pageData.page_en === "chatroom") {
        const url = new URL(window.location.href);
        const urlParams = url.searchParams;
        const queryType = urlParams.get('room');
        api.post('msgDataList', (resData) => {
            if (resData.result) {
                msgUpdate(resData.listData);
            } else {
                alert(resData.msg);
                history.back();
            }
        }, Object.freeze({
            roomId: queryType
        }));
        document.querySelector("#content").style.height = "100%";
        document.querySelector("#footer").style.display = "none";
        const inputField = document.querySelector("#content .chat_input textarea");
        inputField.focus();
        inputField.addEventListener("keydown", (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                msgSend();
            }
        });
    } else {
        document.querySelector("#content").style.height = "calc(100% - 51px)";
        document.querySelector("#footer").style.display = "flex";
        const listItems = document.querySelectorAll('#footer div');
        listItems.forEach(item => {
            if (item.classList.contains('on')) {
                item.classList.remove('on');
            }
        });
        const showIcon = document.querySelector(`#footer div.menu_${pageData.page_en}`);
        if (showIcon) showIcon.classList.add('on');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const link = document.getElementById('spa_link');

    document.body.addEventListener("click", e => { //채팅방 입장 이벤트
        const menuButton = document.getElementById('menuButton');
        const chatMenuSlide = document.getElementById('chatMenuSlide');
        if (!chatMenuSlide.contains(e.target) && e.target !== menuButton) { //메뉴 숨기기
            chatMenuSlide.style.display = 'none';
        }

        let target = e.target;

        while (target && !target.matches('li.list_info')) {
            target = target.parentElement;
        }
        if (target && target.matches('li.list_info')) {
            const userId = target.getAttribute('data-userid');
            if (userId) {
                link.setAttribute('href', `/chat?page=chat&room=${userId}`);
                link.click();
            }
        }

        if (e.target.matches("[data-click]")) {
            const clickedClassName = e.target.className.split(" ");
            const clickData = e.target.getAttribute('data-click');
            switch (clickedClassName[0]) {
                case "header_menu_search": //리스트 검색
                    clickEvent.header_menu_search(clickData);
                    break;
                case "menu_search_2": //리스트 검색2
                    clickEvent.header_menu_search_2(clickData);
                    break;
                case "search_div_btn": //친구추가 검색
                    clickEvent.search_div_btn(clickData);
                    break;
                case "friend_search_btn": //친구추가 요청
                    clickEvent.friend_search_btn(clickData);
                    break;
                case "friend_req_btn": //친구추가 취소
                    clickEvent.friend_req_btn(clickData);
                    break;
                case "friend_res_btn": //친구추가 수락
                    clickEvent.friend_res_btn(clickData);
                    break;
                case "send_btn": //메시지 보내기
                    msgSend();
                    break;
                case "menu_btn": //채팅방 메뉴
                    clickEvent.menu_btn(clickData, e);
                    break;
                case "chatMenu": //채팅방 메뉴
                    clickEvent.menu_btn(clickData, e);
                    break;
            }
        }

    });
});

let lastMsgSentTime = 0;

function msgSend() {
    const currentTime = new Date().getTime();
    const msg = document.querySelector("#content .chat_input textarea").value;

    if (msg && currentTime - lastMsgSentTime >= 1000) {
        const url = new URL(window.location.href);
        const urlParams = url.searchParams;
        const queryType = urlParams.get('room');
        socket.emit("req_msg", {
            msg: msg,
            roomId: queryType
        });

        lastMsgSentTime = currentTime;
    } else if (!msg) {
        alert("메시지를 입력해주세요");
    }
}

function menu_click(type) {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const queryType = urlParams.get('room');
    switch (type) {
        case "favorites":
            api.post('menu_click', (resData) => {
                alert(resData.msg);
            }, {
                type: type,
                roomId: queryType
            });
            break;
        case "exit":
            history.back();
            break;
        case "declaration":
            api.post('menu_click', (resData) => {
                alert(resData.msg);
            }, {
                type: type,
                roomId: queryType
            });
            break;
    }
}