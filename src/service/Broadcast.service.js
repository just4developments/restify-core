const amqp = require('amqplib/callback_api');
const uuid = require('node-uuid');
const ExecutingLogs = require('./ExecutingLogs.service');
const _ = require('lodash');

exports = module.exports = {

    async runTestcase(logItem){
        const TestcaseService = require('./Testcase.service');
        const testCase = await TestcaseService.get(logItem.testcase_id);
        if(testCase.status !== TestcaseService.STATE.TESTING) throw new restify.PreconditionFailedError(`This testcase state is ${testCase.status} != TESTING`);
        await TestcaseService.updateStatus({
            _id: shellClass._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.TESTED : ShellClassService.STATE.TEST_FAILED
        });
        return true;
    },

    async uploadedPlugin(logItem){
        const ShellClassService = require('./ShellClass.service');
        const shellClass = await ShellClassService.get(logItem.shellclass_id);
        if(shellClass.status !== ShellClassService.STATE.UPLOADING) throw new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != UPLOADING`);
        await ShellClassService.updateStatus({
            _id: shellClass._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.UPLOADED : ShellClassService.STATE.UPLOAD_FAILED
        });
        return true;
    },
    
    async deletedPlugin(logItem){
        const ShellClassService = require('./ShellClass.service');
        const shellClass = await ShellClassService.get(logItem.shellclass_id);
        if(shellClass.status !== ShellClassService.STATE.DELETING) throw new restify.PreconditionFailedError(`This instance state is ${shellClass.status} != DELETING`);
        await ShellClassService.updateStatus({
            _id: shellClass._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellClassService.STATE.DELETED : ShellClassService.STATE.DELETE_FAILED
        });
        return true;
    },

    async createdInstance(logItem){             
        const ShellInstanceService = require('./ShellInstance.service');        
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        
        if(shellInstance.status === ShellInstanceService.STATE.CREATING) {
            try{
                if(logItem.status === ExecutingLogs.STATUS.SUCCESSED){                    
                    await ShellInstanceService.updateStatus({
                        _id: shellInstance._id,
                        status: ShellInstanceService.STATE.CREATED
                    });
                    const ShellClassService = require('./ShellClass.service');   
                    const shellClass = await ShellClassService.get(shellInstance.shellclass_id);
                    await exports.insertDefaultTestcases(shellInstance._id, shellClass)
                    return true;
                }else{
                    await ShellInstanceService.delete(shellInstance._id);
                    return false;
                }
            }catch(error){
                throw error;
            }
        }
        return new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != CREATING`);
    },

    async insertDefaultTestcases(shellinstanceId, shellClass){
		let defaultValue = {};
		for(let i in shellClass.testing.parameters){
			const paramObject = shellClass.testing.parameters[i];
			defaultValue[paramObject.param] = paramObject.default;
		}
		const testcases = shellClass.testing.testcases.map((e) => {
			return {
				shellinstance_id: shellinstanceId,
				params: _.extend({}, defaultValue, e)
			};
		});
		const TestcaseService = require('./Testcase.service');
		await TestcaseService.insert(testcases);
	},

    async deployedInstance(logItem) {
        const ShellInstanceService = require('./ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.DEPLOYING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DEPLOYING`);
        await ShellInstanceService.updateStatus({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DEPLOYED : ShellInstanceService.STATE.DEPLOY_FAILED
        });
        return true;
    },

    async undeployedInstance(logItem){
        const ShellInstanceService = require('./ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.UNDEPLOYING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != UNDEPLOYING`);
        await ShellInstanceService.updateStatus({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.UNDEPLOYED : ShellInstanceService.STATE.UNDEPLOY_FAILED
        });
        return true;
    },

    async deletedInstance(logItem){
        const ShellInstanceService = require('./ShellInstance.service');
        const shellInstance = await ShellInstanceService.get(logItem.shellinstance_id.toString());
        if(shellInstance.status !== ShellInstanceService.STATE.DELETING) throw new restify.PreconditionFailedError(`This instance state is ${shellInstance.status} != DELETING`);
        await ShellInstanceService.updateStatus({
            _id: shellInstance._id,
            status: logItem.status === ExecutingLogs.STATUS.SUCCESSED ? ShellInstanceService.STATE.DELETED : ShellInstanceService.STATE.DELETE_FAILED
        });
        return true;
    },

    createApiChannel(conn) {
        return new Promise((resolve, reject) => {
            // API
            conn.createChannel(async (err, ch) => {
                if (err) return reject(err);          
                console.log("Created channel for Api");          
                ch.assertQueue(appconfig.rabbit.api.queueName, {durable: false});
                ch.consume(appconfig.rabbit.api.queueName, async (msg) => {                        
                    console.log("Received from rabbitMQ");
                    try{
                        const rs = JSON.parse(msg.content.toString());
                        const executingLog = await ExecutingLogs.get(rs.SessionId);
                        executingLog.status = rs.Status ? ExecutingLogs.STATUS.FAILED : ExecutingLogs.STATUS.SUCCESSED;
                        executingLog.result = rs.Result;
                        await ExecutingLogs.updateStatus(executingLog);
                        switch (executingLog.event_type) {
                            case ExecutingLogs.EVENT_TYPE.RUN_TESTCASE:
                                await exports.runTestcase(executingLog);
                                break;
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
                                break;
                        }
                        setTimeout(async () => {
                            await exports.broadcastToWeb(rs.SessionId, executingLog);
                        }, appconfig.rabbit.toWebTimeout);
                    }catch(error){
                        console.error(error);
                    }
                }, {
                    noAck: true
                });
            }); 
        });  
    },

    createLogChannel(conn){
        // Log Realtime
        return new Promise(async (resolve, reject) => {
            conn.createChannel((err, ch) => {
                if (err) return reject(err);          
                console.log("Created channel for Log");
                ch.assertQueue(appconfig.rabbit.log.queueName, {durable: false});
                ch.consume(appconfig.rabbit.log.queueName, async (msg) => {
                    try{
                        const rs = JSON.parse(msg.content.toString());
                        let dataToWeb = {
                            windowId: rs.WindowId,
                            msg: rs.Msg
                        };
                        if(!_.isNil(rs.SectionId)) dataToWeb.sectionId = rs.SectionId;
                        await exports.broadcastToWeb(rs.SessionId, dataToWeb, 'log');
                    }catch(error){
                        console.error(error);
                    }
                }, {
                    noAck: true
                });
                resolve();
            });                    
        });
    },

    listenFromRabQ(){
        return new Promise((resolve, reject) => {
            amqp.connect(appconfig.rabbit.url, async (err, conn) => {
                if (err) return reject(err);
                await Promise.all([exports.createApiChannel(conn), exports.createLogChannel(conn)]) 
                resolve();
            });
        });
    },

    broadcastToRabQ: (queueName, data) => {
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

    broadcastToWeb: (sessionId, data, event) => {
        console.log('broadcastToWeb', data);
        try {
            let socket = global.ioer[sessionId];
            if (socket) {
                if (socket.connected) {
                    socket.emit(event || 'completed', JSON.stringify(data));
                } else {
                    delete global.ioer[sessionId];
                }
            }
        } catch (e) {
            console.log('broadcastIO ' + sessionId);
        }
    }
}