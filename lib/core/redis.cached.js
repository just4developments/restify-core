var redisClient = require('redis').createClient;
var redis = redisClient(appconfig.cache.redis.port, appconfig.cache.redis.host);

exports = module.exports = {
    get(key){
        return new Promise((resolve, reject) => {
            redis.get(key, (err, data) => {
                if(err) return reject(err);
                resolve(JSON.parse(data));
            }) 
        });
    },
    set(key, value, lifetime=30000){
        return new Promise((resolve, reject) => {
            redis.set(key, JSON.stringify(value), (err, data) => {
                if(err) return reject(err);
                resolve(value);
            });
            redis.expire(key, lifetime);
        });
    },
    touch(key, lifetime=30000){
        return new Promise((resolve, reject) => {
            redis.expire(key, lifetime);
            resolve();
        });
    }
}