const load = {
  page: (callback) => {
    api.post('page_setting', (resData) => {
      if (resData.result === true) {
        callback({
          result: true,
          data: {
            html: loadHTML(resData.userData),
            title: 'Chat - 설정',
            page: {
              en: 'setting',
              ko: '설정'
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

function loadHTML(userData) {
  const html = `
  <div class="header">
  <h2>설정</h2>
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
<div class="setting">
  <div class="myinfo">
      <div class="myinfo_detaile">
          <div>
            <img src="./image/${userData.userProfile}" alt="유저 프로필">
          </div>
          <div>
            <span class="myinfo_nick">${userData.userNick}</span>
            <span class="myinfo_sub">${userData.userSM}</span>
          </div>
      </div>
      <div class="myinfo_uri">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
              <path
                  d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
          </svg>
      </div>
  </div>
  <div class="setting_fun">
      <span>시연 채팅 페이지라서 채팅 기능이 없어 현재 영역은 공백입니다.</span>
  </div>
</div>
`;
  return html;
}

export default load;