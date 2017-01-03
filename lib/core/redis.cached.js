var redisClient = require('redis').createClient;
var redis = redisClient(appconfig.cache.redis.port, appconfig.cache.redis.host);

exports = module.exports = {
    get(key){
        return new Promise((resolve, reject) => {
            redis.get(key.toString(), (err, data) => {
                if(err) return reject(err);
                resolve(JSON.parse(data));
            }) 
        });
    },
    set(key, value, lifetime=30000){
        return new Promise((resolve, reject) => {
            redis.set(key.toString(), JSON.stringify(value), (err, data) => {
                if(err) return reject(err);
                resolve(value);
            });
            redis.expire(key, lifetime);
        });
    },
    del(key){
        return new Promise((resolve, reject) => {
            redis.del(key.toString(), (err) => {
                if(err) return reject(err);
                resolve()
            }) 
        });
    },
    touch(key, lifetime=30000){
        return new Promise((resolve, reject) => {
            redis.expire(key.toString(), lifetime);
            resolve();
        });
    }
}