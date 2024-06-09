const config = require('../config.js');
const log = require('./log.js');
const crypto = require('./crypto.js');
const fun = require('./function.js');

const mysql = require('mysql').createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.dbname,
    charset: config.db.charset,
    dateStrings: 'date',
    multipleStatements: true
});
mysql.connect(err => {
    if (!err) {
        log.info('Mysql Database Connected');
    } else {
        log.err('Mysql Connect Error!', err);
    }
});

exports.userLogin = (userData) => {
    return new Promise(res => {
        crypto.encrypto_password(userData.pass).then(cryptoRes => {
            const selectQuery = `SELECT sid FROM user WHERE userId = ${mysql.escape(userData.id)} AND userPass = ${mysql.escape(cryptoRes)}`;
            mysql.query(selectQuery, (err, rows) => {
                if (!err) {
                    if (rows.length > 0) {
                        res({
                            result: true,
                            sid: rows[0].sid
                        });
                    } else {
                        res({
                            result: false,
                            msg: "계정이 존재하지 않습니다."
                        });
                    }
                } else {
                    res({
                        result: false,
                        msg: "데이터베이스 오류"
                    });
                }
            });
        });
    });
}

exports.getUserData = (sid) => {
    return new Promise(res => {
        const selectQuery = `SELECT userId, userNick, userSM, userProfile FROM user WHERE sid = ${mysql.escape(sid)}`;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                if (rows.length > 0) {
                    res({
                        result: true,
                        userData: rows[0]
                    });
                } else {
                    res({
                        result: false,
                        msg: "계정이 존재하지 않습니다."
                    });
                }
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.footerCount_headerDot = (userData) => {
    return new Promise(res => {
        const selectQuery = `
        SELECT SUM(count) AS total_count FROM unread_msg WHERE userId = ${mysql.escape(userData.userId)};
        SELECT sid FROM friend_list WHERE res_userId = ${mysql.escape(userData.userId)} AND isAccept = 0;
        `;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                res({
                    result: true,
                    count: rows[0][0].total_count,
                    isResFriend: rows[1].length > 0 ? true : false
                });
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.getListData_list = (userData) => {
    return new Promise(res => {
        const selectQuery = `
        SELECT 
            fl.sid, 
            fl.isFavorites, 
            fl.datetime, 
            u.userNick, 
            u.userProfile,
            u.userSM
        FROM 
            friend_list fl
        JOIN 
            user u ON u.userId = CASE 
                WHEN fl.req_userId = ${mysql.escape(userData.userId)} THEN fl.res_userId 
                    ELSE fl.req_userId 
                END
        WHERE 
            (fl.req_userId = ${mysql.escape(userData.userId)} OR fl.res_userId = ${mysql.escape(userData.userId)}) 
            AND fl.isAccept = 1
        ORDER BY 
        CASE 
            WHEN fl.req_userId = ${mysql.escape(userData.userId)} THEN fl.res_userId 
            ELSE fl.req_userId 
        END;
        `;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                res({
                    result: true,
                    list: rows
                });
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.getListData_friend = (userData) => {
    return new Promise(res => {
        const selectQuery = `
        SELECT 
            u.sid, 
            u.userNick, 
            u.userProfile,
            u.userSM,
        CASE
            WHEN fl.req_userId = ${mysql.escape(userData.userId)} THEN 'req'
            ELSE 'res'
        END AS type
        FROM 
            friend_list fl
        JOIN 
            user u ON u.userId = CASE 
                WHEN fl.req_userId = ${mysql.escape(userData.userId)} THEN fl.res_userId 
                ELSE fl.req_userId 
            END
        WHERE 
            (fl.req_userId = ${mysql.escape(userData.userId)} OR fl.res_userId = ${mysql.escape(userData.userId)}) 
            AND fl.isAccept = 0
        ORDER BY 
            CASE 
                WHEN fl.req_userId = ${mysql.escape(userData.userId)} THEN fl.res_userId 
                ELSE fl.req_userId 
            END;
        `;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                let req_num = 0;
                let res_num = 0;
                const data = rows.map(row => {
                    if (row.type === 'req') {
                        req_num++;
                    } else {
                        res_num++;
                    }
                    return row;
                });
                res({
                    result: true,
                    list: {
                        req_num,
                        res_num,
                        data
                    }
                });
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.getListData_chatlist = (userData) => {
    return new Promise(res => {
        const selectQuery = `
        SELECT 
            r.roomId,
        CASE 
            WHEN r.userId_1 = ${mysql.escape(userData.userId)} THEN u2.userNick
            WHEN r.userId_2 = ${mysql.escape(userData.userId)} THEN u1.userNick
        END AS otherUserNick,
        CASE 
            WHEN r.userId_1 = ${mysql.escape(userData.userId)} THEN u2.userProfile
            WHEN r.userId_2 = ${mysql.escape(userData.userId)} THEN u1.userProfile
        END AS otherUserProfile,
        CASE 
            WHEN r.userId_1 = ${mysql.escape(userData.userId)} THEN u2.userSM
            WHEN r.userId_2 = ${mysql.escape(userData.userId)} THEN u1.userSM
        END AS otherUserSM,
            m.msg AS recentMsg,
            um.count AS unreadMsgCount
        FROM 
            room r
        LEFT JOIN 
            user u1 ON r.userId_1 = u1.userId
        LEFT JOIN 
            user u2 ON r.userId_2 = u2.userId
        LEFT JOIN 
            msg m ON r.roomId = m.roomId AND m.datetime = (
            SELECT MAX(STR_TO_DATE(datetime, '%Y%m%d%H%i%s'))
            FROM msg
            WHERE roomId = r.roomId
        )
        LEFT JOIN 
            unread_msg um ON r.roomId = um.roomId AND um.userId = ${mysql.escape(userData.userId)}
        WHERE 
            r.userId_1 = ${mysql.escape(userData.userId)} OR r.userId_2 = ${mysql.escape(userData.userId)}
        ORDER BY 
            STR_TO_DATE(m.datetime, '%Y%m%d%H%i%s') DESC;
        `;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                res({
                    result: true,
                    list: rows
                });
            } else {
                console.log(err)
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.chat_room = (userData, roomId) => {
    return new Promise(res => {
        if (roomId !== "mine") {
            const sid_decrypto = crypto.decrypto(roomId);
            if (sid_decrypto.result) {
                const participatingUsers = sid_decrypto.data.split("|");
                if (participatingUsers[0] === userData.userId || participatingUsers[1] === userData.userId) {
                    const otherUserId = participatingUsers[0] === userData.userId ? participatingUsers[1] : participatingUsers[0]
                    const selectQuery = `SELECT block FROM room WHERE roomId = ${mysql.escape(roomId)}`;
                    mysql.query(selectQuery, (err_1, rows_1) => {
                        if (!err_1) {
                            if (rows_1.length > 0) {
                                const updateQuery = `UPDATE unread_msg SET count = 0 WHERE userId = ${mysql.escape(userData.userId)} AND roomId = ${mysql.escape(roomId)}`;
                                mysql.query(updateQuery, (err_3) => {
                                    if (!err_3) {
                                        getRoomData(otherUserId);
                                    } else {
                                        res({
                                            result: false,
                                            msg: "데이터베이스 오류",
                                            location: '/chat?page=chatlist'
                                        });
                                    }
                                });
                            } else {
                                const insertQuery = `
                            INSERT INTO room (roomId, userId_1, userId_2, datetime) VALUES (${mysql.escape(roomId)}, ${mysql.escape(userData.userId)}, ${mysql.escape(otherUserId)}, now());
                            INSERT INTO unread_msg (roomId, userId, count) VALUES (${mysql.escape(roomId)}, ${mysql.escape(userData.userId)}, ${mysql.escape(0)});
                            INSERT INTO unread_msg (roomId, userId, count) VALUES (${mysql.escape(roomId)}, ${mysql.escape(otherUserId)}, ${mysql.escape(0)});
                            `;
                                mysql.query(insertQuery, (err_2) => {
                                    if (!err_2) {
                                        getRoomData(otherUserId);
                                    } else {
                                        res({
                                            result: false,
                                            msg: "데이터베이스 오류",
                                            location: '/chat?page=chatlist'
                                        });
                                    }
                                });
                            }

                            function getRoomData(otherId) {
                                const selectQuery_2 = `SELECT sid, userNick, userSM, userProfile FROM user WHERE userId = ${mysql.escape(otherId)}`;
                                mysql.query(selectQuery_2, (err_3, rows_3) => {
                                    if (!err_3) {
                                        if (rows_3.length > 0) {
                                            res({
                                                result: true,
                                                otherData: rows_3[0]
                                            });
                                        } else {
                                            res({
                                                result: false,
                                                msg: "상대방 정보를 읽어 올 수 없습니다.",
                                                location: '/chat?page=chatlist'
                                            });
                                        }
                                    } else {
                                        res({
                                            result: false,
                                            msg: "데이터베이스 오류",
                                            location: '/chat?page=chatlist'
                                        });
                                    }
                                });
                            }
                        } else {
                            res({
                                result: false,
                                msg: "데이터베이스 오류",
                                location: '/chat?page=chatlist'
                            });
                        }
                    });
                } else {
                    res({
                        result: false,
                        msg: '입장 권한이 없습니다.',
                        location: '/chat?page=chatlist'
                    });
                }
            } else {
                res({
                    result: false,
                    msg: sid_decrypto.msg,
                    location: '/chat?page=chatlist'
                });
            }
        } else {
            res({
                result: false,
                msg: "나와의 채팅은 불가능합니다.",
                location: '/chat?page=list'

            });
        }
    });
}

exports.friend_search = (userData, kw) => {
    return new Promise(res => {
        const selectQuery = `SELECT sid, userNick, userSM, userProfile FROM user WHERE userNick LIKE ${mysql.escape('%' + kw + '%')}`;
        mysql.query(selectQuery, (err, rows) => {
            if (!err) {
                res({
                    result: true,
                    data: rows
                });
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.friend_search_btn = (userData, sid) => {
    return new Promise(res => {
        const selectQuery_1 = `SELECT sid, userId, userNick, userProfile FROM user WHERE sid = ${mysql.escape(sid)}`;
        mysql.query(selectQuery_1, (err_1, rows_1) => {
            if (!err_1) {
                if (rows_1.length > 0) {
                    if (userData.userId === rows_1[0].userId) {
                        res({
                            result: false,
                            msg: "본인에게는 친구 요청을 할 수 없습니다."
                        });
                    } else {
                        const selectQuery_2 = `SELECT sid FROM friend_list WHERE (req_userId = ${mysql.escape(userData.userId)} AND res_userId = ${mysql.escape(rows_1[0].userId)}) OR (req_userId = ${mysql.escape(rows_1[0].userId)} AND res_userId = ${mysql.escape(userData.userId)})`;
                        mysql.query(selectQuery_2, (err_2, rows_2) => {
                            if (!err_2) {
                                if (rows_2.length > 0) {
                                    res({
                                        result: false,
                                        msg: "이미 친구 상태이거나 요청 상태입니다."
                                    });
                                } else {
                                    const sid_encrypto = crypto.encrypto(`${userData.userId}|${rows_1[0].userId}`);
                                    if (sid_encrypto.result) {
                                        const insertQuery = `INSERT INTO friend_list (sid, req_userId, res_userId, datetime) VALUES (${mysql.escape(sid_encrypto.data)}, ${mysql.escape(userData.userId)}, ${mysql.escape(rows_1[0].userId)}, now())`;
                                        mysql.query(insertQuery, (err_3) => {
                                            if (!err_3) {
                                                res({
                                                    result: true,
                                                    msg: `${rows_1[0].userNick} 님에게 친구 요청을 보냈습니다.`,
                                                    data: {
                                                        cryptoId: sid_encrypto,
                                                        sid: rows_1[0].sid,
                                                        userNick: rows_1[0].userNick,
                                                        userProfile: rows_1[0].userProfile
                                                    }
                                                });
                                            } else {
                                                res({
                                                    result: false,
                                                    msg: "데이터베이스 오류"
                                                });
                                            }
                                        });
                                    } else {
                                        res({
                                            result: false,
                                            msg: "방 생성 오류"
                                        });
                                    }
                                }
                            } else {
                                res({
                                    result: false,
                                    msg: "데이터베이스 오류"
                                });
                            }
                        });
                    }
                } else {
                    res({
                        result: false,
                        msg: "계정이 존재하지 않습니다."
                    });
                }
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.friend_cancle = (userData, sid) => {
    return new Promise(res => {
        const selectQuery_1 = `SELECT sid, userId, userNick FROM user WHERE sid = ${mysql.escape(sid)}`;
        mysql.query(selectQuery_1, (err_1, rows_1) => {
            if (!err_1) {
                if (rows_1.length > 0) {
                    const selectQuery_2 = `SELECT * FROM friend_list WHERE (req_userId = ${mysql.escape(userData.userId)} AND res_userId = ${mysql.escape(rows_1[0].userId)}) OR (req_userId = ${mysql.escape(rows_1[0].userId)} AND res_userId = ${mysql.escape(userData.userId)})`;
                    mysql.query(selectQuery_2, (err_2, rows_2) => {
                        if (!err_2) {
                            if (rows_2.length > 0) {
                                const deleteQuery = `DELETE FROM friend_list WHERE (req_userId = ${mysql.escape(userData.userId)} AND res_userId = ${mysql.escape(rows_1[0].userId)}) OR (req_userId = ${mysql.escape(rows_1[0].userId)} AND res_userId = ${mysql.escape(userData.userId)})`;
                                mysql.query(deleteQuery, (err_3) => {
                                    if (!err_3) {
                                        res({
                                            result: true,
                                            msg: `${rows_1[0].userNick} 님의 친구 요청을 취소하였습니다.`
                                        });
                                    } else {
                                        res({
                                            result: false,
                                            msg: "데이터베이스 오류"
                                        });
                                    }
                                });
                            } else {
                                res({
                                    result: false,
                                    msg: "요청 데이터가 없습니다."
                                });
                            }
                        } else {
                            res({
                                result: false,
                                msg: "데이터베이스 오류"
                            });
                        }
                    });
                } else {
                    res({
                        result: false,
                        msg: "계정이 존재하지 않습니다."
                    });
                }
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.friend_accept = (userData, sid) => {
    return new Promise(res => {
        const selectQuery = `SELECT sid, userId, userNick FROM user WHERE sid = ${mysql.escape(sid)}`;
        mysql.query(selectQuery, (err_1, rows_1) => {
            if (!err_1) {
                if (rows_1.length > 0) {
                    const selectQuery_2 = `SELECT * FROM friend_list WHERE (req_userId = ${mysql.escape(userData.userId)} AND res_userId = ${mysql.escape(rows_1[0].userId)}) OR (req_userId = ${mysql.escape(rows_1[0].userId)} AND res_userId = ${mysql.escape(userData.userId)})`;
                    mysql.query(selectQuery_2, (err_2, rows_2) => {
                        if (!err_2) {
                            if (rows_2.length > 0) {
                                const updateQuery = `UPDATE friend_list SET isAccept = 1 WHERE (req_userId = ${mysql.escape(userData.userId)} AND res_userId = ${mysql.escape(rows_1[0].userId)}) OR (req_userId = ${mysql.escape(rows_1[0].userId)} AND res_userId = ${mysql.escape(userData.userId)})`;
                                mysql.query(updateQuery, (err_3) => {
                                    if (!err_3) {
                                        res({
                                            result: true,
                                            msg: `${rows_1[0].userNick} 님의 친구 요청을 수락하였습니다.`
                                        });
                                    } else {
                                        res({
                                            result: false,
                                            msg: "데이터베이스 오류"
                                        });
                                    }
                                });
                            } else {
                                res({
                                    result: false,
                                    msg: "요청 데이터가 없습니다."
                                });
                            }
                        } else {
                            res({
                                result: false,
                                msg: "데이터베이스 오류"
                            });
                        }
                    });
                } else {
                    res({
                        result: false,
                        msg: "계정이 존재하지 않습니다."
                    });
                }
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류"
                });
            }
        });
    });
}

exports.msgDataList = (userData, roomId) => {
    return new Promise(res => {
        const sid_decrypto = crypto.decrypto(roomId);
        if (sid_decrypto.result) {
            const participatingUsers = sid_decrypto.data.split("|");
            if (userData.userId === participatingUsers[0] || userData.userId === participatingUsers[1]) {
                const selectQuery = `
                SELECT
                    m.roomId,
                    m.msgId,
                    m.sender_id,
                    m.recipient_id,
                    m.msg,
                    m.datetime AS msg_datetime,
                    u.userNick,
                    u.userProfile
                FROM
                    msg m
                LEFT JOIN
                    \`user\` u
                ON
                    m.sender_id = u.userId
                WHERE
                    m.roomId = ${mysql.escape(roomId)};
                `;
                mysql.query(selectQuery, (err, rows) => {
                    if (!err) {
                        let arr = [];
                        for (let i = 0; i < rows.length; i++) {
                            arr.push({
                                datetime: rows[i].msg_datetime,
                                msg: rows[i].msg,
                                msgId: rows[i].msgId,
                                roomId: rows[i].roomId,
                                sender: {
                                    senderNick: rows[i].userNick,
                                    senderProfile: rows[i].userProfile
                                },
                                type: rows[i].sender_id === userData.userId ? "mine" : "other",
                                updateNum: {
                                    footer: false,
                                    roomList: false,
                                    top: false
                                }
                            });
                        }
                        res({
                            result: true,
                            listData: arr
                        });
                    } else {
                        res({
                            result: false,
                            msg: "데이터베이스 오류"
                        });
                    }
                });
            } else {
                res({
                    result: false,
                    msg: "접근 권한이 없습니다."
                });
            }
        } else {
            res({
                result: false,
                msg: sid_decrypto.msg
            });
        }
    });
}

exports.remove_roomCount = (userData, roomId) => {
    return new Promise(res => {
        const updateQuery = `UPDATE unread_msg SET count = 0 WHERE userId = ${mysql.escape(userData.userId)} AND roomId = ${mysql.escape(roomId)}`;
        mysql.query(updateQuery, (err) => {
            if (!err) {
                res({
                    result: true
                });
            } else {
                res({
                    result: false,
                    msg: "데이터베이스 오류",
                    location: '/chat?page=chatlist'
                });
            }
        });
    });
}

exports.menu_click = (userData, data) => {
    return new Promise(res => {
        let query = "";
        switch (data.type) {
            case "favorites":
                query = `UPDATE friend_list SET isFavorites = CASE WHEN isFavorites = 0 THEN 1 ELSE 0 END WHERE (req_userId = ${mysql.escape(userData.userId)} OR res_userId = ${mysql.escape(userData.userId)}) AND sid = ${mysql.escape(data.roomId)};`;
                break;
            case "declaration":
                query = `INSERT INTO declaration (userId, roomId, datetime) VALUES (${mysql.escape(userData.userId)}, ${mysql.escape(data.roomId)}, now())`;
                break;
        }
        mysql.query(query, (err, rows) => {
            if (!err) {
                res({
                    result: true,
                    msg: data.type === "favorites" ? "성공적으로 완료되었습니다." : "신고가 완료되었습니다."
                });
            }
        });
    });
}

/* ============================================================= */

exports.req_msg = (userData, roomData) => {
    return new Promise(res => {
        if (roomData.msg !== "") {
            const sid_decrypto = crypto.decrypto(roomData.roomId);
            if (sid_decrypto.result) {
                const msgId = fun.generateRandomString(15);
                const participatingUsers = sid_decrypto.data.split("|");
                const otherUserId = participatingUsers[0] === userData.userId ? participatingUsers[1] : participatingUsers[0];
                if (userData.userId === participatingUsers[0] || userData.userId === participatingUsers[1]) {
                    const insertQuery = `INSERT INTO msg (roomId, msgId, sender_id, recipient_id, msg, datetime) VALUES (${mysql.escape(roomData.roomId)}, ${mysql.escape(msgId)}, ${mysql.escape(userData.userId)}, ${mysql.escape(otherUserId)}, ${mysql.escape(fun.escapeHtml(roomData.msg))}, DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'));
                    UPDATE unread_msg SET count = count + 1 WHERE roomId = ${mysql.escape(roomData.roomId)} AND userId = ${mysql.escape(otherUserId)};
                    `;
                    mysql.query(insertQuery, (err) => {
                        if (!err) {
                            res({
                                result: true,
                                msgData: {
                                    msgId: msgId,
                                    datetime: fun.getCurrentDateTime()
                                },
                                otherId: otherUserId
                            });
                        } else {
                            res({
                                result: false,
                                msg: "데이터베이스 오류"
                            });
                        }
                    });
                } else {
                    res({
                        result: false,
                        msg: "접근 권한이 없습니다."
                    });
                }
            } else {
                res({
                    result: false,
                    msg: sid_decrypto.msg
                });
            }
        } else {
            res({
                result: false,
                msg: "메시지를 작성해주세요"
            });
        }
    });
}
