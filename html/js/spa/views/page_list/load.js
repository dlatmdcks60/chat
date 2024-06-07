const load = {
  page: (callback) => {
    api.post('page_list', (resData) => {
      if (resData.result === true) {
        callback({
          result: true,
          data: {
            html: loadHTML(resData.userData, resData.listData),
            title: 'Chat - 친구 목록',
            page: {
              en: 'list',
              ko: '친구 목록'
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

function loadHTML(userData, listData) {
  const html = `
  <div class="header">
  <h2>채팅</h2>
  <div class="header_menu">
    <div href="/chat?page=friend" data-link class="header_menu_friend" title="친구 추가">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3C0 496.5 15.52 512 34.66 512h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM616 200h-48v-48C568 138.8 557.3 128 544 128s-24 10.75-24 24v48h-48C458.8 200 448 210.8 448 224s10.75 24 24 24h48v48C520 309.3 530.8 320 544 320s24-10.75 24-24v-48h48C629.3 248 640 237.3 640 224S629.3 200 616 200z" style="pointer-events: none;"></path>
      </svg>
      <span class="notification-dot"></span>
    </div>
    <div class="header_menu_search" data-click="" title="검색">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
      </svg>
    </div>
  </div>
</div>
<div class="main_search_div">
  <input type="text">
  <button class="menu_search_2" data-click="list">검색</button>
</div>
<div class="contentList">
  <div class="list_my">
      <h3 class="subject_title">프로필</h3>
      <ul>
        <li class="list_info room drag_protection" data-userid="mine">
          <div class="list_info_1">
              <img src="./image/${userData.userProfile}" alt="유저 프로필">
          </div>
          <div class="list_info_2">
              <span class="user_nick">${userData.userNick}</span>
              <span class="user_detail">${userData.userSM}</span>
          </div>
        </li>
      </ul>
  </div>
  <div class="list_favorites">
      <h3 class="subject_title">즐겨찾기</h3>
      <ul>
        ${listData.length > 0
        ? listData.map(value => `${value.isFavorites.data[0] === 1 ? '<li class="list_info room drag_protection" data-userid="'+value.sid+'"><div class="list_info_1"><img src="./image/'+value.userProfile+'" alt="유저 프로필"></div><div class="list_info_2"><span class="user_nick">'+value.userNick+'</span><span class="user_detail">'+value.userSM+'</span></div></li>' : ''}`).join('')
        : '<span class="noneData drag_protection">목록 없음</span>'}
      </ul>
  </div>
  <div class="list_friend">
      <h3 class="subject_title">친구 ${listData.length}</h3>
        ${listData.length > 0
        ? listData.map(value => '<li class="list_info room drag_protection" data-userid="'+value.sid+'"><div class="list_info_1"><img src="./image/'+value.userProfile+'" alt="유저 프로필"></div><div class="list_info_2"><span class="user_nick">'+value.userNick+'</span><span class="user_detail">'+value.userSM+'</span></div></li>').join('')
        : '<span class="noneData drag_protection">목록 없음</span>'}
  </div>
</div>
`;
  return html;
}

export default load;