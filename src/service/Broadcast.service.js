let amqp = require('amqplib/callback_api');

let executingLogs = require('./ExecutingLogs.service')();

exports = module.exports = {

    listenFromRabQ: (channelName, type) => {
        console.log('listenFromRabQ');
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                if(err) return reject(err);
                conn.createChannel(function(err, ch) {
                    if(err) return reject(err);
                    ch.assertExchange(channelName, type, {durable: false});
                    ch.assertQueue('', {exclusive: true}, function(err, q) {
                        if(err) return reject(err);
                        ch.bindQueue(q.queue, channelName, '');
                        ch.consume(q.queue, function(msg) {
                            let rs = JSON.parse(msg.content.toString());                            
                            executingLogs.get(rs['#']).then((item) => {
                                item.status = rs.error ? executingLogs.STATUS.FAILED : executingLogs.STATUS.SUCCESSED;
                                item.result = rs; 
                                executingLogs.update(item).then((rs) => {
                                    setTimeout(() => {
                                        exports.broadcastToWeb(rs['#'], item);
                                    }, 2000);
                                }).catch(reject); 
                            }).catch(reject);
                        }, {noAck: true});
                        resolve();
                    });
                });
            });
        });
    },

    broadcastToRabQ: (channelName, type, data) => {
        console.log('broadcastToRabQ', data);
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    ch.assertExchange(channelName, type, {
                        durable: false
                    });
                    ch.publish(channelName, type, new Buffer(JSON.stringify(data)));
                    resolve(data);
                });
                setTimeout(() => {
                    if (conn) conn.close;
                }, appconfig.rabbit.timeout);
            });
        });
    },

    broadcastToWeb: (sessionId, data) => {
        console.log('broadcastToWeb', data);
        try {
            let socket = global.ioer[sessionId];
            if (socket) {
                if (socket.connected) {
                    socket.emit('completed', data);
                } else {
                    delete global.ioer[sessionId];
                }
            }
        } catch (e) {
            console.log('broadcastIO ' + sessionId);
        }
    }
}