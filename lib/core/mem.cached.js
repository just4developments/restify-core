const Memcached = require('memcached');
const memcached = new Memcached(`${appconfig.cache.memcached.host}:${appconfig.cache.memcached.port}`);

exports = module.exports = {
    open(){
        const rs = {
            get(key) {
                return new Promise((resolve, reject) => {
                    memcached.get(key.toString(), (err, data) => {
                        if(err) return reject(err);
                        resolve(data)
                    }) 
                });
            },
            set(key, value, lifetime=30000){
                return new Promise((resolve, reject) => {
                    memcached.set(key.toString(), value, lifetime, (err, data) => {
                        if(err) return reject(err);
                        resolve(value)
                    }) 
                });
            },
            del(key){
                return new Promise((resolve, reject) => {
                    memcached.del(key.toString(), (err) => {
                        if(err) return reject(err);
                        resolve()
                    }) 
                });
            },
            touch(key, lifetime){
                return new Promise((resolve, reject) => {
                    memcached.touch(key.toString(), lifetime, (err, data) => {
                        if(err) return reject(err);
                        resolve(value)
                    }) 
                });
            },
            close(){
                memcached.end();
            }
        };
        return rs;
    }
}