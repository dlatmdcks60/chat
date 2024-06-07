const load = {
    page: (callback) => {
        api.post('friend_list', (resData) => {
            if (resData.result === true) {
                callback({
                    result: true,
                    data: {
                        html: loadHTML(resData.listData),
                        title: 'Chat - 친구 추가',
                        page: {
                            en: 'friend',
                            ko: '친구 추가'
                        }
                    }
                });
            } else {
                alert(resData.msg);
                location.replace(resData.location);
            }
        });
    },
}

function loadHTML(listData) {
    const html = `
    <div class="header">
    <h2>친구 추가</h2>
    <div class="header_menu">
        <div href="/chat?page=friend" data-link class="header_menu_friend" title="친구 추가">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path
                    d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3C0 496.5 15.52 512 34.66 512h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM616 200h-48v-48C568 138.8 557.3 128 544 128s-24 10.75-24 24v48h-48C458.8 200 448 210.8 448 224s10.75 24 24 24h48v48C520 309.3 530.8 320 544 320s24-10.75 24-24v-48h48C629.3 248 640 237.3 640 224S629.3 200 616 200z"
                    style="pointer-events: none;"></path>
            </svg>
            <span class="notification-dot"></span>
        </div>
    </div>
  </div>
  <div class="friend_section drag_protection">
    <div class="search_div">
        <input type="text" placeholder="닉네임 검색">
        <ul></ul>
        <button data-click="" class="search_div_btn">검색</button>
    </div>
    <div class="req_div">
        <h3>보낸 요청</h3>
        <ul>
            ${listData.req_num > 0
            ? listData.data.map(value => `${value.type === "req" ? '<li><div class="usesr_info"><img src="./image/'+value.userProfile+'" alt="유저 프로필"><span class="user_nick">'+value.userNick+'</span></div><button data-click="'+value.sid+'" class="friend_req_btn">취소</button></li>' : ""}`).join('')
            : '<span class="noneData">보낸 요청이 없습니다.</span>'}
        </ul>
    </div>
    <div class="res_div">
        <h3>받은 요청</h3>
        <ul>
            ${listData.res_num > 0
            ? listData.data.map(value => `${value.type === "res" ? '<li><div class="usesr_info"><img src="./image/'+value.userProfile+'" alt="유저 프로필"><span class="user_nick">'+value.userNick+'</span></div><button data-click="'+value.sid+'" class="friend_res_btn">수락</button></li>' : ""}`).join('')
            : '<span class="noneData">받은 요청이 없습니다.</span>'}
        </ul>
    </div>
  </div>
    `;
    return html;
}

export default load;