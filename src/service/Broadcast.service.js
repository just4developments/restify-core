let amqp = require('amqplib/callback_api');
let uuid = require('node-uuid');
let ExecutingLogs = require('./ExecutingLogs.service');

exports = module.exports = {

    uploadedPlugin: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellClassService = require('../service/ShellClass.service');
            ShellClassService.get(logItem.shellclass_id.toString()).then((shellClass) => {
                if(shellClass.status !== ShellClassService.STATE.UPLOADING) return reject(new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != UPLOADING`));
                ShellClassService.update({
                    _id: shellClass._id,
                    status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.UPLOADED : ShellClassService.STATE.UPLOAD_FAILED
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    },
    
    deletedPlugin: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellClassService = require('../service/ShellClass.service');
            ShellClassService.get(logItem.shellclass_id.toString()).then((shellClass) => {
                if(shellClass.status !== ShellClassService.STATE.DELETING) return reject(new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != DELETING`));
                ShellClassService.update({
                    _id: shellClass._id,
                    status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.DELETED : ShellClassService.STATE.DELETE_FAILED
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    createdInstance: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellInstanceService = require('../service/ShellInstance.service');
            ShellInstanceService.get(logItem.shellinstance_id.toString()).then((shellInstance) => {
                if(shellInstance.status === ShellInstanceService.STATE.CREATING) {
                    if(logItem.status === ExecutingLogs.STATUS.SUCCESSED){                    
                        ShellInstanceService.update({
                            _id: shellInstance._id,
                            status: ShellInstanceService.STATE.CREATED
                        }).then(resolve).catch(reject);
                    }else{
                        ShellInstanceService.delete(shellInstance._id).then(resolve).catch(reject);
                    }
                }else {
                    return reject(new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != CREATING`));
                }
            }).catch(reject);
        });
    },

    deployedInstance: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellInstanceService = require('../service/ShellInstance.service');
            ShellInstanceService.get(logItem.shellinstance_id.toString()).then((shellInstance) => {
                if(shellInstance.status !== ShellInstanceService.STATE.DEPLOYING) return reject(new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DEPLOYING`));
                ShellInstanceService.update({
                    _id: shellInstance._id,
                    status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DEPLOYED : ShellInstanceService.STATE.DEPLOY_FAILED
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    undeployedInstance: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellInstanceService = require('../service/ShellInstance.service');
            ShellInstanceService.get(logItem.shellinstance_id.toString()).then((shellInstance) => {
                if(shellInstance.status !== ShellInstanceService.STATE.UNDEPLOYING) return reject(new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != UNDEPLOYING`));
                ShellInstanceService.update({
                    _id: shellInstance._id,
                    status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.UNDEPLOYED : ShellInstanceService.STATE.UNDEPLOY_FAILED
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    deletedInstance: (logItem) => {
        return new Promise((resolve, reject) => {
            let ShellInstanceService = require('../service/ShellInstance.service');
            ShellInstanceService.get(logItem.shellinstance_id.toString()).then((shellInstance) => {
                if(shellInstance.status !== ShellInstanceService.STATE.DELETING) return reject(new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DELETING`));
                ShellInstanceService.update({
                    _id: shellInstance._id,
                    status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DELETED : ShellInstanceService.STATE.DELETE_FAILED
                }).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    listenFromRabQ: (exchange, queueName, exchangeType) => {
        console.log('Listened from RabQ', queueName);
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                if (err) return reject(err);
                conn.createChannel(function (err, ch) {
                    if (err) return reject(err);
                    ch.assertQueue(queueName, {durable: false});
                    ch.consume(queueName, function (msg) {
                        console.log("Received from rabbitMQ");
                        let rs;
                        try{
                            rs = JSON.parse(msg.content.toString());
                        }catch(e){
                            return reject(e);
                        }                            
                        ExecutingLogs.get(rs.SessionId).then((item) => {
                            item.status = rs.Status ? ExecutingLogs.STATUS.FAILED : ExecutingLogs.STATUS.SUCCESSED;
                            item.result = rs.Result;
                            ExecutingLogs.update(item).then((rs0) => {
                                let done = () => {
                                    setTimeout(() => {
                                        exports.broadcastToWeb(rs.SessionId, item);
                                    }, appconfig.rabbit.toWebTimeout);
                                };
                                switch (item.event_type) {
                                    case ExecutingLogs.EVENT_TYPE.UPLOAD_PLUGIN:
                                        exports.uploadedPlugin(item).then(done).catch(reject);   
                                        break;
                                    case ExecutingLogs.EVENT_TYPE.DELETE_PLUGIN:
                                        exports.deletedPlugin(item).then(done).catch(reject);   
                                        break;
                                    case ExecutingLogs.EVENT_TYPE.CREATE_INSTANCE:
                                        exports.createdInstance(item).then(done).catch(reject);   
                                        break;
                                    case ExecutingLogs.EVENT_TYPE.DEPLOY_INSTANCE: 
                                        exports.deployedInstance(item).then(done).catch(reject);
                                        break;
                                    case ExecutingLogs.EVENT_TYPE.UNDEPLOY_INSTANCE: 
                                        exports.undeployedInstance(item).then(done).catch(reject);
                                        break;
                                    case ExecutingLogs.EVENT_TYPE.DELETE_INSTANCE: 
                                        exports.deletedInstance(item).then(done).catch(reject);
                                        break;
                                    default:
                                        done();
                                        break;
                                }
                            }).catch(reject);
                        }).catch(reject);
                    }, {
                        noAck: true
                    });
                    resolve();
                });
            });
        });
    },

    broadcastToRabQ: (exchange, queueName, exchangeType, data) => {
        console.log('BroadcastToRabQ', queueName, data);
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                conn.createChannel(function (err, ch) {
                    ch.assertQueue(queueName, {durable: false});
                    ch.sendToQueue(queueName, new Buffer(JSON.stringify(data)));
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
    //                     let ExecutingLogs = require('./ExecutingLogs.service');
    //                     ExecutingLogs.get(rs.SessionId).then((item) => {
    //                         item.status = rs.error ? ExecutingLogs.STATUS.FAILED : ExecutingLogs.STATUS.SUCCESSED;
    //                         item.result = rs;
    //                         ExecutingLogs.update(item).then((rs0) => {
    //                             setTimeout(() => {
    //                                 exports.broadcastToWeb(rs.SessionId, item);
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