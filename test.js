<<<<<<< HEAD
var a = {
    "app.name": "Vietnamese",    
    "logout": "Đăng xuất"
}
=======
let http = require('./src/service/http.service');
http.post('http://localhost:9600/login', {
    headers: {
        'content-type': 'application/json',
		pj: '58997ac77e9a4435508973bf'
    },
    data: {
        username: 'thanh13',
		password: '123'
    }
}).then((resp) => {
    console.log(resp);
});
>>>>>>> 97064882824c4fbd970a20568056a6fdf2eac882
