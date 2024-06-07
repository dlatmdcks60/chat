exports.generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters[randomIndex];
    }

    return result;
}

exports.getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

exports.findSocketUser = (io, id) => {
    return new Promise((res) => {
        let userData = [];
        let count = 0;
        for (const [socketId, socket] of io.entries()) {
            count++;
            if (socket.userId === id) {
                userData.push({
                    socketData: socket,
                    socketId: socketId
                });
            }
            if (count === io.size) {
                res(userData);
            }
        }
        if (io.size === 0) {
            res(userData);
        }
    });
}

exports.escapeHtml = (msg) => {
    const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    };
    return String(msg).replace(/[&<>"'`=\/]/g, s => {
        return entityMap[s];
    });
}