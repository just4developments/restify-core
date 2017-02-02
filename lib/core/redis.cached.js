const redisClient = require('redis').createClient;

exports = module.exports = {
    open() {
        const redis = redisClient(appconfig.cache.redis.port, appconfig.cache.redis.host, appconfig.cache.redis.opts);
        const rs = {
            get(key){
                return new Promise((resolve, reject) => {
                    redis.get(key.toString(), (err, data) => {
                        if(err) return reject(err);
                        resolve(JSON.parse(data));
                    }) 
                });
            },
            set(key, value, lifetime=0){
                return new Promise((resolve, reject) => {
                    redis.set(key.toString(), JSON.stringify(value), (err, data) => {
                        if(err) return reject(err);                        
                        rs.touch(key.toString(), lifetime).then(() => {
                            resolve(value);
                        }).catch(reject);                  
                    });            
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
            touch(key, lifetime=300){
                return new Promise((resolve, reject) => {
                    lifetime = +lifetime;
                    if(lifetime <= 0) return resolve();
                    if(lifetime > 1800) {
                        redis.expireat(key.toString(), Math.round(+new Date()/1000)+lifetime, (err) => {
                            if(err) return reject(err);
                            resolve(); 
                        });
                    }else {
                        redis.expire(key.toString(), lifetime, (err) => {
                            if(err) return reject(err);
                            resolve(); 
                        });
                    }
                });
            },
            close(){
                redis.quit();
            }
        };
        return rs;
    }    
}