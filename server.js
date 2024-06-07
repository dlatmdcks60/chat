/*ssl 인증파일*/
const fs = require('fs');
const options = {
    key: fs.readFileSync(""),
    cert: fs.readFileSync(""),
    ca: fs.readFileSync(""),
    minVersion: "TLSv1.2"
};
/*ssl 인증파일*/

const config = require('./config.js');
const log = require('./modules/log.js');
const userHandler = require('./modules/user.js');
const mysqlHandler = require('./modules/mysql.js');
const fun = require('./modules/function.js');
const crypto = require('./modules/crypto.js');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const express = require("express");
const path = require('path');
const app = express();
const https = require('https').createServer(options, app);
const io = require('socket.io')(https, { //v - 4.7.1
    pingTimeout: 10000
});

app.set("views", path.join(__dirname, "./html/view"));
app.use('/image', express.static(path.join(__dirname, './html/img')));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("html"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.get("/", (req, res) => { //index 페이지
    userHandler.userChk(req, res, false, userRes => {
        if (userRes.access) {
            res.render("index.html", {});
        } else {
            res.render("login.html", {});
        }
    });
});
app.get("/chat", (req, res) => { //채팅방 페이지
    userHandler.userChk(req, res, false, userRes => {
        if (userRes.access) {
            res.render("index.html", {});
        } else {
            res.render("login.html", {});
        }
    });
});
app.get("/login", (req, res) => { //로그인 페이지
    userHandler.userChk(req, res, false, userRes => {
        if (userRes.access) {
            res.render("index.html", {});
        } else {
            res.render("login.html", {});
        }
    });
});

/* ============================================================== */
app.post('/userData', (req, res) => { //계정 데이터
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.result) {
            res.json({
                result: userRes.result,
                userData: userRes.userData,
            });
        } else {
            res.json(userRes);
        }
    });
});
app.post('/login', (req, res) => { //로그인 처리
    userHandler.login(req, res, userRes => {
        if (userRes.result) {
            res.json(userRes);
        } else {
            res.json(userRes);
        }
    });
});
app.post('/footerCount_headerDot', (req, res) => { //footer, header정보 불러오기
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.footerCount_headerDot(userRes.userData).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json(userRes);
        }
    });
});
app.post('/page_list', (req, res) => { //리스트 페이지
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.getListData_list(userRes.userData).then(dbRes => {
                if (dbRes.result) {
                    res.json({
                        result: dbRes.result,
                        userData: userRes.userData,
                        listData: dbRes.list
                    });
                } else {
                    res.json(dbRes);
                }
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/friend_list', (req, res) => { //친구추가 페이지
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.getListData_friend(userRes.userData).then(dbRes => {
                if (dbRes.result) {
                    res.json({
                        result: dbRes.result,
                        listData: dbRes.list
                    });
                } else {
                    res.json(dbRes);
                }
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/page_chatlist', (req, res) => { //채팅목록 페이지
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.getListData_chatlist(userRes.userData).then(dbRes => {
                if (dbRes.result) {
                    res.json({
                        result: dbRes.result,
                        listData: dbRes.list
                    });
                } else {
                    res.json(dbRes);
                }
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/page_setting', (req, res) => { //설정 페이지
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            res.json({
                result: userRes.access,
                userData: userRes.userData
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/chat_room', (req, res) => { //채팅방 페이지
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.chat_room(userRes.userData, req.body.roomId).then(dbRes => {
                if (dbRes.result) {
                    res.json({
                        result: dbRes.result,
                        otherData: dbRes.otherData
                    });
                } else {
                    res.json(dbRes);
                }
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/friend_search', (req, res) => { //친구추가 친구 검색
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.friend_search(userRes.userData, req.body.kw).then(dbRes => {
                if (dbRes.result) {
                    res.json({
                        result: dbRes.result,
                        data: dbRes.data
                    });
                } else {
                    res.json(dbRes);
                }
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/friend_search_btn', (req, res) => { //친구추가 친구 요청
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.friend_search_btn(userRes.userData, req.body.sid).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/friend_cancle', (req, res) => { //친구추가 친구 요청 (취소)
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.friend_cancle(userRes.userData, req.body.sid).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/friend_accept', (req, res) => { //친구추가 친구 요청 (수락)
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.friend_accept(userRes.userData, req.body.sid).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/msgDataList', (req, res) => { //메시지 데이터 불러오기
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.msgDataList(userRes.userData, req.body.roomId).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/remove_roomCount', (req, res) => { //채팅방 카운트 제거
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.remove_roomCount(userRes.userData, req.body.roomId).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
app.post('/menu_click', (req, res) => { //메뉴 클릭
    userHandler.userChk(req, res, true, userRes => {
        if (userRes.access) {
            mysqlHandler.menu_click(userRes.userData, {
                type: req.body.type,
                roomId: req.body.roomId
            }).then(dbRes => {
                res.json(dbRes);
            });
        } else {
            res.json({
                result: userRes.access,
                msg: userRes.msg,
                location: '/login'
            });
        }
    });
});
/* ============================================================== */
io.on('connection', (socket) => {
    let userData; //소켓에서 필요한 유저 정보 저장
    socket.emit("userData_req"); //유저 데이터 요청
    socket.on("userData", (data) => { //유저 데이터 수신
        userData = data.userData;
        socket.userId = data.userData.userId; //접속 유저를 찾기위한 유저아이디 저장
        socket.page = data.pageData.page;
        socket.room = data.pageData.room;
    });
    socket.on("chg_page", (data) => { //페이지 변경 감지
        socket.page = data.page;
        socket.room = data.room;
    });

    socket.on("req_msg", (data) => { //메시지 전송
        mysqlHandler.req_msg(userData, data).then(dbRes => {
            if (dbRes.result) {
                socket.emit("res_msg", [{
                    roomId: data.roomId,
                    msgId: dbRes.msgData.msgId,
                    msg: data.msg,
                    type: "mine",
                    sender: {
                        senderNick: userData.userNick,
                        senderProfile: userData.userProfile,
                    },
                    datetime: dbRes.msgData.datetime,
                    updateNum: {
                        footer: false,
                        top: false,
                        roomList: false
                    }
                }]);
                fun.findSocketUser(io.sockets.sockets, dbRes.otherId).then(socket_res => { //현재 소켓에 접속한 유저 정보 찾기
                    for (let i = 0; i < socket_res.length; i++) { //중복 로그인을 위한 for문
                        io.to(socket_res[i].socketId).emit('res_msg', [{
                            roomId: data.roomId,
                            msgId: dbRes.msgData.msgId,
                            msg: data.msg,
                            type: "other",
                            sender: {
                                senderNick: userData.userNick,
                                senderProfile: userData.userProfile,
                            },
                            datetime: dbRes.msgData.datetime,
                            updateNum: {
                                footer: socket_res[i].socketData.page !== "chat" ? true : false,
                                top: false,
                                roomList: socket_res[i].socketData.page === "chatlist" ? true : false
                            }
                        }]);

                    }
                });
            } else {
                socket.emit("error", dbRes);
            }
        });
    });
    socket.on("friend_search_btn", (data) => { //친구요청 실시간 => 수신, 발신
        const sid_decrypto = crypto.decrypto(data.data);
        if (sid_decrypto.result) {
            const participatingUsers = sid_decrypto.data.split("|");
            const otherUserId = participatingUsers[0] === userData.userId ? participatingUsers[1] : participatingUsers[0];

            fun.findSocketUser(io.sockets.sockets, otherUserId).then(socket_res => {
                for (let i = 0; i < socket_res.length; i++) {
                    io.to(socket_res[i].socketId).emit('friend_search_btn_socket', true);
                }
            });
        } else {
            socket.emit("error", {
                result: false,
                msg: sid_decrypto.msg
            });
        }
    });
}); //io


https.listen(config.port.port, () => {
    log.info('Server running. port: ' + config.port.port)
});