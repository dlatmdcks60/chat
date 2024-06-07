function chatServer() {
    this.db = new function () {
        this.host = '127.0.0.1';
        this.port = 3306;
        this.user = '';
        this.password = '';
        this.dbname = '';
        this.charset = 'utf8mb4';
    }();
    this.port = new function () {
        this.port = 80;
    }();
    this.crypto = new function () {
        this.algorithm = 'aes-256-ctr';
        this.length = 16;
        this.salt = 'Osgasds/nSswNlyAS/dwsdCqwdAHat==';
        this.byte = 16;
    }();
    this.salt = new function () {
        this.time = 90831;
        this.byte = 64;
        this.type = 'base64';
        this.hash = 'sha512';
    }();
    this.token = new(function () {
        this.access = "fb133oxn6idsdnv88sgyqzvsjil49pbpvww3s9xonez09f2m73di2bw4m360ownzxe12ha0dz56w6vsd1cg7o3nz1gd7o8tg1984";
        this.refresh = "ytv9m3x6na6ow7naeuf3gi9zt5czwmdcrha3blzjg1oasds35s6fvutzzda5ji3hazzzzjricp5wsw165o8l02js013cy8wrcb1mv";
    })();
    this.cookie = new(function () {
        this.access_time = 1000 * 60 * 60 * 2;
        this.refresh_time = 1000 * 60 * 60 * 6;
    })();
}

module.exports = new chatServer();