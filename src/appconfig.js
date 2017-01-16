exports = module.exports = {
    // configFile: 'D:\\sources\\validium-api\\validium.cfg',
    configFile: '/etc/validium/validium.cfg',
    // listen: 9600,
    db: {
        // url: 'mongodb://localhost:27017/authtwo'
    },
    cache: {
        // memcached: {            
        //     host: 'localhost', 
        //     port: 11211
        // },
        redis: {
            use: true,
            // host: 'localhost',
            // port: 6379
        }
    },
    loadConfig(){        
        return new Promise((resolve, reject) => {            
            const fs = require('fs');
            const stream = require('stream');
            const readline = require('readline');
            const rl = readline.createInterface({
                input: fs.createReadStream(exports.configFile),
                output: new stream()
            });
            let validiumConfig = {};
            let currentKey;
            rl.on('line', (input) => {
                input = input.trim();
                if(input.length === 0) return;
                if(/^\[[^\]]+\]$/.test(input)){
                    currentKey = input.substr(1, input.length-2);
                    validiumConfig[currentKey] = {};
                }else {
                    let [k,v] = input.split('=');
                    if(/^\[[^\]]+\]$/.test(v)){
                        validiumConfig[currentKey][k] = eval(v);
                    }else {
                        validiumConfig[currentKey][k] = v;
                    }
                }
            });
            rl.on('error', (err) => {
                reject(err);
            });
            rl.on('close', () => {
                exports.listen = validiumConfig['web.auth']['listen'];
                exports.db.url = validiumConfig['web.auth']['db.url'];
                exports.cache.redis.host = validiumConfig['web.auth']['cache.host']; 
                exports.cache.redis.port = validiumConfig['web.auth']['cache.port']; 
                resolve(exports);
            });
        });        
    }
    // app: {
    //     imageResize: {
	// 		product: [
    //             {w: -1000 }, // Auto resize origin when width > 1000. If width < 1000 do nothing
    //             {w: 32, h: 32, ext: 'thumb'},
    //             {w: 224, h: 200, ext: 'list.pc'},
    //             {w: 358, h: 200, ext: 'list.tab'},
    //             {w: 270, h: 200, ext: 'list.mob'}
	// 		]
    //     }
    // }
}