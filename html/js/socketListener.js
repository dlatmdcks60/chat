const socket = io.connect('wss://' + location.hostname);

socket.on("userData_req", () => {
    api.post('userData', (resData) => {
        if (resData.access) {
            const url = new URL(window.location.href);
            const urlParams = url.searchParams;
            const queryType = urlParams.get('page');
            socket.emit("userData", {
                userData: resData.userData,
                pageData: {
                    page: queryType,
                    room: queryType === "chat" ? urlParams.get('room') : null
                }
            });
        } else {
            socket.close();
        }
    });
});
socket.on("error", (data) => { //에러 수신
    alert(data.msg);
});

socket.on("res_msg", (data) => { //메시지 수신
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const queryType = urlParams.get('room');
    if (queryType === data[0].roomId) {
        msgUpdate(data);
    }
    if (data[0].type === "mine") {
        document.querySelector("#content .chat_input textarea").value = "";
    } else {
        if (queryType === data[0].roomId) {
            api.post('remove_roomCount', (resData) => {
                if (!resData.result) {
                    alert(resData.msg);
                }
            }, {
                roomId: data[0].roomId
            });
        }
    }

    if (data[0].updateNum.footer) {
        const div = document.querySelector("#footer div.menu_chatlist span.count");
        div.textContent = Number(div.textContent) + 1;
        if (Number(div.textContent) > 0) div.classList.add("on");
    }
    if (data[0].updateNum.roomList) {
        const divAll = document.querySelectorAll("#content .contentList ul li");
        for (let i = 0; i < divAll.length; i++) {
            const dataId = divAll[i].getAttribute('data-userid');
            if (dataId === data[0].roomId) {
                let spanData = Number(divAll[i].querySelector(".list_info_3 span.room_num").textContent);
                divAll[i].querySelector(".list_info_3 span.room_num").textContent = spanData + 1;
                divAll[i].querySelector(".list_info_2 span.user_detail").textContent = data[0].msg;
                if (spanData > 0) {
                    divAll[i].querySelector(".list_info_3 span.room_num").classList.add("on");
                }
            }
        }
    }
});

socket.on("friend_search_btn_socket", (data) => { //친구추가 수신 표시
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const queryType = urlParams.get('page');
    if (data) {
        document.querySelector(".header_menu_friend .notification-dot").classList.add("on")
    }
    if (queryType === "friend") {
        location.reload();
    }
});