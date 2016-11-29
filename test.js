var path = require('path');
var utils = require('./src/utils');

utils.resizeImage(path.join(__dirname, 'assets', 'images', 'test.jpg'), require('./src/appconfig').app.imageResize.product).then(() => {
    console.log('Ok');
}).catch((err) => {
    console.log(err);
});