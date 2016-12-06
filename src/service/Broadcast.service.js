let amqp = require('amqplib/callback_api');
let uuid = require('node-uuid');

exports = module.exports = {

    listenFromRabQ: (exchange, queueName, exchangeType) => {
        console.log('Listened from RabQ');
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                if (err) return reject(err);
                conn.createChannel(function (err, ch) {
                    if (err) return reject(err);
                    ch.assertExchange(exchange, exchangeType, {
                        durable: false
                    });
                    ch.assertQueue(queueName, {
                        exclusive: true
                    }, function (err, q) {
                        if (err) return reject(err);
                        ch.bindQueue(q.queue, exchange, '');
                        ch.consume(q.queue, function (msg) {
                            console.log("Received from rabbitMQ");
                            let rs;
                            try{
                                rs = JSON.parse(msg.content.toString());
                            }catch(e){
                                return reject(e);
                            }
                            let executingLogs = require('./ExecutingLogs.service');
                            executingLogs.get(rs['#']).then((item) => {
                                item.status = rs.Error ? executingLogs.STATUS.FAILED : executingLogs.STATUS.SUCCESSED;
                                item.result = rs;
                                executingLogs.update(item).then((rs0) => {
                                    setTimeout(() => {
                                        exports.broadcastToWeb(rs['#'], item);
                                    }, appconfig.rabbit.toWebTimeout);
                                }).catch(reject);
                            }).catch(reject);
                        }, {
                            noAck: true
                        });
                        resolve();
                    });
                });
            });
        });
    },

    broadcastToRabQ: (exchange, queueName, exchangeType, data) => {
        console.log('BroadcastToRabQ', exchange, exchangeType, data);
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    ch.assertExchange(exchange, exchangeType, {
                        durable: false
                    });
                    ch.publish(exchange, '', new Buffer(JSON.stringify(data)));
                    resolve(data);
                });
                if (conn){
                    setTimeout(() => {
                        conn.close;
                    }, appconfig.rabbit.closeTimeout);
                }
            });
        });
    },

    // listenFromRabQ: (channelName, type) => {
    //     return new Promise((resolve, reject) => {
    //         amqp.connect(appconfig.rabbit.url, function(err, conn) {
    //             conn.createChannel(function(err, ch) {                    
    //                 ch.assertQueue(channelName, {durable: false});
    //                 ch.prefetch(1);
    //                 console.log(' [x] Awaiting RPC requests');
    //                 ch.consume(channelName, function reply(msg) {                        
    //                     let rs = null;
    //                     try{
    //                         rs = JSON.parse(msg.content.toString());
    //                     }catch(e){
    //                         return reject(e);
    //                     }
    //                     let executingLogs = require('./ExecutingLogs.service');
    //                     executingLogs.get(rs['#']).then((item) => {
    //                         item.status = rs.error ? executingLogs.STATUS.FAILED : executingLogs.STATUS.SUCCESSED;
    //                         item.result = rs;
    //                         executingLogs.update(item).then((rs0) => {
    //                             setTimeout(() => {
    //                                 exports.broadcastToWeb(rs['#'], item);
    //                             }, appconfig.rabbit.toWebTimeout);
    //                         }).catch(reject);
    //                     }).catch(reject);
    //                 });
    //             });
    //         });
    //     });
    // },

    // broadcastToRabQ: (channelName, type, data) => {
    //     console.log('broadcastToRabQ', channelName, type, data);
    //     return new Promise((resolve, reject) => {
    //         amqp.connect(appconfig.rabbit.url, function (err, conn) {
    //             conn.createChannel(function (err, ch) {
    //                 ch.assertQueue('', {
    //                     exclusive: true
    //                 }, function (err, q) {
    //                     ch.sendToQueue(channelName, new Buffer(JSON.stringify(data)), {
    //                         correlationId: uuid.v4(),
    //                         replyTo: q.queue
    //                     });
    //                 });
    //                 setTimeout(() => {
    //                     if (conn) conn.close;
    //                 }, appconfig.rabbit.closeTimeout);
    //             });
    //         });
    //     });
    // },

    broadcastToWeb: (sessionId, data) => {
        console.log('broadcastToWeb', data);
        try {
            let socket = global.ioer[sessionId];
            if (socket) {
                if (socket.connected) {
                    socket.emit('completed', JSON.stringify(data));
                } else {
                    delete global.ioer[sessionId];
                }
            }
        } catch (e) {
            console.log('broadcastIO ' + sessionId);
        }
    }
}