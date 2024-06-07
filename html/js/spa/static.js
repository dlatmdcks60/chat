import page_list from "./views/page_list/index.js"; //친구 목록
import page_chatlist from "./views/page_chatlist/index.js"; //채팅 목록
import page_chat from "./views/page_chat/index.js"; //대화방
import page_friend from "./views/page_friend/index.js"; //친구추가
import page_setting from "./views/page_setting/index.js"; //설정
/* =========================================================== */

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
}

const router = async () => {
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;
  const queryType = urlParams.get('page');
  const routes = [{
    type: 'page_list',
    view: page_list
  }, {
    type: 'page_chatlist',
    view: page_chatlist
  }, {
    type: 'page_chat',
    view: page_chat
  }, {
    type: 'page_setting',
    view: page_setting
  }, {
    type: 'page_friend',
    view: page_friend
  }];

  const potentialMatches = (text) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].type === text) {
        const view = new routes[i].view();
        view.getHtml().then(resData => {
          if (resData.result === true) {
            document.querySelector('body #content').innerHTML = resData.html;
            socket.emit("chg_page", {
              page: queryType,
              room: queryType === "chat" ? urlParams.get('room') : null
            });
            eventListener(Object.freeze({
              page_en: resData.page_en,
              page_ko: resData.page_ko
            }));
          } else {
            location.replace('/none');
          }
        });
        return;
      }
    }
  }

  if (queryType === 'list') {
    potentialMatches('page_list');
  } else if (queryType === 'setting') {
    potentialMatches('page_setting');
  } else if (queryType === 'chatlist') {
    potentialMatches('page_chatlist');
  } else if (queryType === 'chat') {
    potentialMatches('page_chat');
  } else if (queryType === 'friend') {
    potentialMatches('page_friend');
  } else {
    location.replace('/chat?page=list');
  }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      if (e.target.localName !== 'a') {
        if (location.port !== '') {
          navigateTo(e.target.attributes[0].nodeValue);
        } else {
          navigateTo(e.target.attributes[0].nodeValue);
        }
      } else {
        navigateTo(e.target.href);
      }
    }
  });
  router();
});