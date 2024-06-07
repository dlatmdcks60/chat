const load = {
    page: (callback) => {
        const url = new URL(window.location.href);
        const urlParams = url.searchParams;
        const queryType = urlParams.get('room');
        api.post('chat_room', (resData) => {
            if (resData.result === true) {
                callback({
                    result: true,
                    data: {
                        html: loadHTML(resData.otherData),
                        title: `${resData.otherData.userNick} | 대화방`,
                        page: {
                            en: 'chatroom',
                            ko: `${resData.otherData.userNick} | 대화방`
                        }
                    }
                });
            } else {
                alert(resData.msg);
                if (resData.location) location.replace(resData.location);
            }
        }, Object.freeze({
            roomId: queryType
        }));
    },
}

function loadHTML(otherData) {
    const html = `
            <div class="chat_menu drag_protection">
                <div class="left_menu">
                    <div class="back_btn">
                        <svg onclick="history.back()" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" style="display: inline; pointer-events: auto;">
                            <path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z" style="pointer-events: auto;"></path>
                        </svg>
                    </div>
                    <div   div class="user_info">
                        <div class="user_info_profile">
                            <img src="./image/${otherData.userProfile}" alt="유저 프로필">
                        </div>
                        <div class="user_info_2">
                            <span class="user_info_nick">${otherData.userNick}</span>
                            <span class="user_info_sm">${otherData.userSM}</span>
                        </div>
                    </div>
                </div>
                <div class="right_menu">
                    <div class="menu_btn" data-click>
                        <svg class="chatMenu" data-click data-menutype="chatView-menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="pointer-events: none; display: inline;">
                            <path d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z" style="pointer-events: none;"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="chat_msg">
                <ul class="list"></ul>
            </div>
            <div class="chat_input">
                <textarea></textarea>
                <button class="send_btn on drag_protection" data-click>전송</button>
            </div>
    `;
    return html;
}

export default load;