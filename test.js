require('./src/appconfig');
let test = require('./src/service/ShellClass.service')();
test.broadcast('installer', 'fanout', {
    '#': 12312,
    target: 'test1',
    link: 'http://192.168.0.111:8080/shells/upload_e97ac872bf12c9fbf14ce2692037a7bd.zip'
});