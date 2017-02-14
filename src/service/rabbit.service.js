const amqp = require('amqplib/callback_api');
const _ = require('lodash');

exports = module.exports = {
    QUEUE: {
        LOG: 'log',
        API: 'api'
    },
    createApiChannel() {
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.app.rabbit.url, async (err, conn) => {
                if (err) return reject(err);
                conn.createChannel(async (err, ch) => {
                    if (err) return reject(err);          
                    console.log("Created channel for Api");          
                    ch.assertQueue(exports.QUEUE.API, {durable: false});
                    ch.consume(exports.QUEUE.API, async (msg) => {                        
                        console.log("Received from rabbitMQ", msg.content.toString());
                        try{
                            const rs = JSON.parse(msg.content.toString());
                            // {
                            //     SessionId:
                            //     Status:
                            //     Result:
                            // }                            
                            setTimeout(async () => {
                                await exports.broadcastToWeb(rs.SessionId, executingLog);
                            }, global.appconfig.app.rabbit.toWebTimeout);
                        }catch(error){
                            console.error(error);
                        }
                    }, {
                        noAck: true
                    });
                }); 
            });
        });  
    },

    // Log Realtime
    createLogChannel() {        
        return new Promise(async (resolve, reject) => {
            amqp.connect(appconfig.app.rabbit.url, async (err, conn) => {
                if (err) return reject(err);
                conn.createChannel((err, ch) => {
                    if (err) return reject(err);          
                    console.log("Created channel for Log");
                    ch.assertQueue(exports.QUEUE.LOG, {durable: false});
                    ch.consume(exports.QUEUE.LOG, async (msg) => {
                        console.log('Received from log queue', msg.content.toString());
                        try{
                            const rs = JSON.parse(msg.content.toString());
                            // let dataToWeb;
                            // if(_.isNil(rs.Progress)){
                            //     if(_.isNil(rs.SectionId)) throw 'SectionId in log queue was not defined'
                            //     dataToWeb = {
                            //         windowId: rs.WindowId,
                            //         msg: rs.Msg,
                            //         sectionId: rs.SectionId
                            //     };
                            // }else {
                            //     dataToWeb = {
                            //         windowId: rs.WindowId,
                            //         progress: rs.Progress,
                            //         sectionId: rs.SectionId
                            //     }
                            // }
                            // await exports.broadcastToWeb(rs.SessionId, dataToWeb, 'log');
                        }catch(error){
                            console.error(error);
                        }
                    }, {
                        noAck: true
                    });
                    resolve();
                });                    
            });
        });
    },

    async listen(){        
        await Promise.all([exports.createApiChannel(), exports.createLogChannel()]);
        console.log('Created channels in rabbit');
    },

    send(queueName, data) {
        console.log('BroadcastToRabQ', queueName, data);
        return new Promise((resolve, reject) => {
            try{
                amqp.connect(appconfig.app.rabbit.url, { timeout: appconfig.app.rabbit.connectTimeout }, function (err, conn) {
                    if(err) return reject(err);
                    conn.createChannel(function (err, ch) {
                        if(err) return reject(err);
                        ch.assertQueue(queueName, {durable: false});
                        ch.sendToQueue(queueName, new Buffer(JSON.stringify(data)));                        
                        setTimeout(() => {
                            conn.close((err) => {
                                if(err) return console.error(err);
                                resolve(data);
                            });
                        }, appconfig.app.rabbit.closeTimeout);
                    });
                });
            }catch(error){
                reject(error);
            }
        });
    }
}