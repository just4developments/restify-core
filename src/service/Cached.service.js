let cachedName;

if(appconfig.cache.redis && appconfig.cache.redis.use) {
    cachedName = 'redis.cached';
}else if(appconfig.cache.memcached){
    cachedName = 'mem.cached';
}else if(appconfig.cache.redis){
    cachedName = 'redis.cached';
}
module.exports = require(`../../lib/core/${cachedName}`);