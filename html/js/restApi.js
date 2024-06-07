const api = {
    post: (url, callback, data) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status == 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.log(xhr)
            }
        }
        xhr.open('POST', `${location.protocol}//${location.hostname}/${String(url)}`);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(JSON.stringify(data));
    },
    get: (url, callback, data) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status == 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.log(xhr);
            }
        }
        xhr.open('GET', `${location.protocol}//${location.hostname}/${String(url)}${data ? data : ''}`);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send();
    }
}