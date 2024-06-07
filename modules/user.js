const config = require('../config.js');
const mysqlHandler = require('./mysql.js');
const jwtHandler = require('./jwt.js');

function tokenIssued(res, data, callback) {
    if (data.isTokenIssued) {
        const token_create = jwtHandler.create_token(data.sid);
        res.cookie('access', token_create.access, {
            maxAge: config.cookie.access_time,
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });
        res.cookie('refresh', token_create.refresh, {
            maxAge: config.cookie.refresh_time,
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });
    }

    if (data.isData) {
        mysqlHandler.getUserData(data.sid).then(dbRes => {
            if (dbRes.result === true) {
                callback({
                    access: true,
                    isData: true,
                    userData: dbRes.userData
                });
            } else {
                callback({
                    access: false,
                    isData: false,
                    msg: dbRes.msg
                });
            }
        });
    } else {
        callback({
            access: true,
            isData: false
        });
    }
}

exports.login = (req, res, callback) => {
    mysqlHandler.userLogin({
        id: req.body.userId,
        pass: req.body.userPassword
    }).then(dbRes => {
        if (dbRes.result) {
            tokenIssued(res, {
                isData: false,
                isTokenIssued: true,
                sid: dbRes.sid
            }, (tokenData) => {
                callback(dbRes);
            });
        } else {
            callback(dbRes);
        }
    });
}
exports.userChk = (req, res, getData, callback) => {
    if (req.cookies['access'] !== undefined) {
        let chkToken_access = jwtHandler.chkToken(req.cookies['access']);
        if (chkToken_access.name === 'TokenExpiredError') {
            if (req.cookies['refresh'] !== undefined) {
                let chkToken_refresh = jwtHandler.chkToken(req.cookies['refresh']);
                if (chkToken_refresh.name === 'TokenExpiredError') {
                    res.clearCookie('access');
                    res.clearCookie('refresh');
                    callback({
                        access: false,
                        isData: false,
                        msg: "토큰이 만료되었습니다."
                    });
                } else if (chkToken_refresh.name === 'JsonWebTokenError') {
                    res.clearCookie('access');
                    res.clearCookie('refresh');
                    callback({
                        access: false,
                        isData: false,
                        msg: "토큰에 오류가 있습니다."
                    });
                } else {
                    tokenIssued(res, {
                        isData: getData,
                        isTokenIssued: true,
                        sid: chkToken_refresh.sid
                    }, (data) => {
                        callback(data);
                    });
                }
            } else {
                res.clearCookie('access');
                res.clearCookie('refresh');
                callback({
                    access: false,
                    isData: false,
                    msg: "토큰이 존재하지 않습니다."
                });
            }
        } else if (chkToken_access.name === 'JsonWebTokenError') {
            res.clearCookie('access');
            res.clearCookie('refresh');
            callback({
                access: false,
                isData: false,
                msg: "토큰에 오류가 있습니다."
            });
        } else {
            tokenIssued(res, {
                isData: getData,
                isTokenIssued: false,
                sid: chkToken_access.sid
            }, (data) => {
                callback(data);
            });
        }
    } else {
        if (req.cookies['refresh'] !== undefined) {
            let chkToken_refresh = jwtHandler.chkToken(req.cookies['refresh']);
            if (chkToken_refresh.name === 'TokenExpiredError') {
                res.clearCookie('refresh');
                callback({
                    access: false,
                    isData: false,
                    msg: "토큰이 만료되었습니다."
                });
            } else if (chkToken_refresh.name === 'JsonWebTokenError') {
                res.clearCookie('refresh');
                callback({
                    access: false,
                    isData: false,
                    msg: "토큰에 오류가 있습니다."
                });
            } else {
                tokenIssued(res, {
                    isData: getData,
                    isTokenIssued: true,
                    sid: chkToken_refresh.sid
                }, (data) => {
                    callback(data);
                });
            }
        } else {
            callback({
                access: false,
                isData: false,
                msg: "비로그인"
            });
        }
    }
}