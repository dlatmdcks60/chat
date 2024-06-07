const config = require('../config.js');
const jwt = require('jsonwebtoken');

const generateAccessToken = (sid) => {
    return jwt.sign({
        type: 'JWT',
        sid: sid
    }, config.token.access, {
        expiresIn: '60m',
        issuer: 'Token Admin',
    });
};

const generateRefreshToken = (sid) => {
    return jwt.sign({
        type: 'JWT',
        sid: sid
    }, config.token.access, {
        expiresIn: '360m',
        issuer: 'Token Admin',
    });
};

exports.chkToken = (token) => {
    try {
        const chk = jwt.verify(token, config.token.access);
        if (chk) {
            return chk;
        }
    } catch (e) {
        return e;
    }
}

exports.create_token = (sid) => {
    const token = {
        access: generateAccessToken(sid),
        refresh: generateRefreshToken(sid)
    }
    return token;
}