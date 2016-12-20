const amqp = require('amqplib/callback_api');
const uuid = require('node-uuid');
const ExecutingLogs = require('./ExecutingLogs.service');
const _ = require('lodash');

exports = module.exports = {

    async uploadedPlugin(logItem){
        const ShellClassService = require('../service/ShellClass.service');
        const shellClass = await ShellClassService.get(logItem.shellclass_id);
        if(shellClass.status !== ShellClassService.STATE.UPLOADING) throw new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != UPLOADING`);
        await ShellClassService.update({
            _id: shellClass._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.UPLOADED : ShellClassService.STATE.UPLOAD_FAILED
        });
        return true;
    },
    
    async deletedPlugin(logItem){
        const ShellClassService = require('../service/ShellClass.service');
        const shellClass = await ShellClassService.get(logItem.shellclass_id);
        if(shellClass.status !== ShellClassService.STATE.DELETING) throw new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != DELETING`);
        await ShellClassService.update({
            _id: shellClass._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.DELETED : ShellClassService.STATE.DELETE_FAILED
        });
        return true;
    },

    async createdInstance(logItem){
        const ShellInstanceService = require('../service/ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status === ShellInstanceService.STATE.CREATING) {
            if(logItem.status === ExecutingLogs.STATUS.SUCCESSED){                    
                await ShellInstanceService.update({
                    _id: shellInstance._id,
                    status: ShellInstanceService.STATE.CREATED
                });
                return true;
            }else{
                await ShellInstanceService.delete(shellInstance._id);
                return false;
            }
        }
        return reject(new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != CREATING`));
    },

    async deployedInstance(logItem) {
        const ShellInstanceService = require('../service/ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.DEPLOYING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DEPLOYING`);
        await ShellInstanceService.update({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DEPLOYED : ShellInstanceService.STATE.DEPLOY_FAILED
        });
        return true;
    },

    async undeployedInstance(logItem){
        const ShellInstanceService = require('../service/ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.UNDEPLOYING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != UNDEPLOYING`);
        await ShellInstanceService.update({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.UNDEPLOYED : ShellInstanceService.STATE.UNDEPLOY_FAILED
        });
        return true;
    },

    async deletedInstance(logItem){
        const ShellInstanceService = require('../service/ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.DELETING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DELETING`);
        await ShellInstanceService.update({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DELETED : ShellInstanceService.STATE.DELETE_FAILED
        });
        return true;
    },

    async test(rs){
        try{
            const executingLog = await ExecutingLogs.get(rs.SessionId);
            executingLog.status = rs.Status ? ExecutingLogs.STATUS.FAILED : ExecutingLogs.STATUS.SUCCESSED;
            executingLog.result = rs.Result;
            await ExecutingLogs.update(executingLog);
            switch (executingLog.event_type) {
                case ExecutingLogs.EVENT_TYPE.UPLOAD_PLUGIN:
                    exports.uploadedPlugin(executingLog);
                    break;
                case ExecutingLogs.EVENT_TYPE.DELETE_PLUGIN:
                    exports.deletedPlugin(executingLog);
                    break;
                case ExecutingLogs.EVENT_TYPE.CREATE_INSTANCE:
                    exports.createdInstance(executingLog);
                    break;
                case ExecutingLogs.EVENT_TYPE.DEPLOY_INSTANCE: 
                    exports.deployedInstance(executingLog);
                    break;
                case ExecutingLogs.EVENT_TYPE.UNDEPLOY_INSTANCE: 
                    exports.undeployedInstance(executingLog);
                    break;
                case ExecutingLogs.EVENT_TYPE.DELETE_INSTANCE: 
                    exports.deletedInstance(executingLog);
                    break;
                default:
                    setTimeout(() => {
                        exports.broadcastToWeb(rs.SessionId, executingLog);
                    }, appconfig.rabbit.toWebTimeout);
                    break;
            }
        }catch(error){
            console.error(error);
        }
    },

    listenFromRabQ(exchange, queueName, exchangeType){
        console.log('Listened from RabQ', queueName);
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, function (err, conn) {
                if (err) return reject(err);
                conn.createChannel((err, ch) => {
                    if (err) return reject(err);
                    ch.assertQueue(queueName, {durable: false});
                    ch.consume(queueName, async (msg) => {                        
                        console.log("Received from rabbitMQ", rs);
                        try{
                            const rs = JSON.parse(msg.content.toString());
                            const executingLog = await ExecutingLogs.get(rs.SessionId);
                            executingLog.status = rs.Status ? ExecutingLogs.STATUS.FAILED : ExecutingLogs.STATUS.SUCCESSED;
                            executingLog.result = rs.Result;
                            await ExecutingLogs.update(executingLog);
                            switch (executingLog.event_type) {
                                case ExecutingLogs.EVENT_TYPE.UPLOAD_PLUGIN:
                                    await exports.uploadedPlugin(executingLog);
                                    break;
                                case ExecutingLogs.EVENT_TYPE.DELETE_PLUGIN:
                                    await exports.deletedPlugin(executingLog);
                                    break;
                                case ExecutingLogs.EVENT_TYPE.CREATE_INSTANCE:
                                    await exports.createdInstance(executingLog);
                                    break;
                                case ExecutingLogs.EVENT_TYPE.DEPLOY_INSTANCE: 
                                    await exports.deployedInstance(executingLog);
                                    break;
                                case ExecutingLogs.EVENT_TYPE.UNDEPLOY_INSTANCE: 
                                    await exports.undeployedInstance(executingLog);
                                    break;
                                case ExecutingLogs.EVENT_TYPE.DELETE_INSTANCE: 
                                    await exports.deletedInstance(executingLog);
                                    break;
                                default:
                                    setTimeout(async () => {
                                        await exports.broadcastToWeb(rs.SessionId, executingLog);
                                    }, appconfig.rabbit.toWebTimeout);
                                    break;
                            }
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

    broadcastToRabQ: (exchange, queueName, exchangeType, data) => {
        console.log('BroadcastToRabQ', queueName, data);
        return new Promise((resolve, reject) => {
            try{
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
            }catch(error){
                reject(error);
            }
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