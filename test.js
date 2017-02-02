global.appconfig = require('./src/appconfig');
const CachedService = require('./src/service/Cached.service');
CachedService.open().del('account.586b1eb386a7d81eb46b7333').then((err) => {
    console.log(err);
})