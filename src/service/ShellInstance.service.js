const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ShellInstanceController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 3:42:44 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "ShellInstance",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	STATE: {
        CREATING: 0,
        CREATED: 1,
        CREATE_FAILED: -1,
        DEPLOYING: 2,
        DEPLOYED: 3,
        DEPLOY_FAILED: -3,
        UNDEPLOYING: 4,
        UNDEPLOYED: 5,
        UNDEPLOY_FAILED: -5,
        DELETING: 6,
        DELETED: 7,
        DELETE_FAILED: -7 
    },
    STATUS: {
        RUNNING: 0,
        SUCCESSED: 1,
        FAILED: -1
    },
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item.shellclass_id = db.uuid(item.shellclass_id);
				item.input_data = utils.valid('input_data', item.input_data, Object);
				item.status = exports.STATE.CREATING;
				item.created_date = new Date();
				item.updated_date = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item.shellclass_id = db.uuid(utils.valid('shellclass_id', item.shellclass_id, [String, db.Uuid]));
				item.input_data = utils.valid('input_data', item.input_data, Object);
				item.updated_date = new Date();
				item.status = utils.valid('status', item.status, Number);
				
				break;
			case exports.VALIDATE.GET:
				item.shellclass_id = db.uuid(utils.valid('shellclass_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item._id = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:
				if(item.shellclass_id) item.shellclass_id = db.uuid(item.shellclass_id);

				break;
		}
		return item;
	},

	async getInstanceAvail(shellclass_id){
		return await exports.find({count: true, where: {shellclass_id: shellclass_id, status: { $ne: exports.STATE.DELETED } }});
    },

	async createInstance(shellInstance) {		
		const ShellClassService = require('./ShellClass.service');
		shellInstance = await exports.insert(shellInstance);		
		const shellClass = await ShellClassService.get(shellInstance.shellclass_id);
		const ExecutingLogs = require('./ExecutingLogs.service');
		const rabSession = await ExecutingLogs.insert({
			event_type: ExecutingLogs.EVENT_TYPE.CREATE_INSTANCE,
			event_name: 'CREATE INSTANCE',
			status: ExecutingLogs.STATUS.RUNNING,
			title: shellInstance.input_data.name,
			shellinstance_id: shellInstance._id
		});
		let data = {
			SessionId: rabSession._id.toString(),
			Command: appconfig.rabbit.channel.createInstance.cmd,
			Params: {
				deployment_id: shellInstance.input_data.name,
				blueprint_id: shellClass.name,
				cloud_ip: appconfig.rabbit.cloud_ip,
				input_string: shellInstance.input_data,
			},
			From: appconfig.rabbit.api.queueName
		}
		const BroadcastService = require('./Broadcast.service');
		await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.createInstance.exchange, appconfig.rabbit.channel.createInstance.queueName, appconfig.rabbit.channel.createInstance.exchangeType, data);
		return data;
    },

	async deployInstance(_id) {		
		const shellInstance = await exports.get(_id);
		if([exports.STATE.CREATED, exports.STATE.UNDEPLOYED, exports.STATE.DEPLOY_FAILED, exports.STATE.DELETE_FAILED].indexOf(shellInstance.status) !== -1) {
			await exports.updateStatus({
				_id: shellInstance._id,
				status: exports.STATE.DEPLOYING
			});
			const ExecutingLogs = require('./ExecutingLogs.service');
			const rabSession = await ExecutingLogs.insert({
				event_type: ExecutingLogs.EVENT_TYPE.DEPLOY_INSTANCE,
				status: ExecutingLogs.STATUS.RUNNING,
				event_name: 'DEPLOY INSTANCE',
				title: shellInstance.input_data.name,
				shellinstance_id: shellInstance._id
			});
			const data = {
				SessionId: rabSession._id.toString(),
				Command: appconfig.rabbit.channel.deployInstance.cmd,
				Params: {
					cloud_ip: appconfig.rabbit.cloud_ip,
					deployment_id: shellInstance.input_data.name,
				},
				From: appconfig.rabbit.api.queueName
			};
			let BroadcastService = require('./Broadcast.service');
			await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.deployInstance.exchange, appconfig.rabbit.channel.deployInstance.queueName, appconfig.rabbit.channel.deployInstance.exchangeType, data);
			return data.SessionId;
		}
		throw new restify.PreconditionFailedError('This instance must be created before deploying');
    },

	async undeployInstance(_id){
		const shellInstance = await exports.get(_id);
		if([exports.STATE.DEPLOYED, exports.STATE.UNDEPLOY_FAILED].indexOf(shellInstance.status) !== -1) {
			await exports.updateStatus({
				_id: shellInstance._id,
				status: exports.STATE.UNDEPLOYING
			});
			const ExecutingLogs = require('./ExecutingLogs.service');
			const rabSession = await ExecutingLogs.insert({
				event_type: ExecutingLogs.EVENT_TYPE.UNDEPLOY_INSTANCE,
				event_name: 'UNDEPLOY INSTANCE',
				status: ExecutingLogs.STATUS.RUNNING,
				title: shellInstance.input_data.name,
				shellinstance_id: shellInstance._id
			});
			const data = {
				SessionId: rabSession._id.toString(),
				Command: appconfig.rabbit.channel.undeployInstance.cmd,
				Params: {
					cloud_ip: appconfig.rabbit.cloud_ip,
					deployment_id: shellInstance.input_data.name,
				},
				From: appconfig.rabbit.api.queueName
			};
			const BroadcastService = require('./Broadcast.service');
			await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.undeployInstance.exchange, appconfig.rabbit.channel.undeployInstance.queueName, appconfig.rabbit.channel.undeployInstance.exchangeType, data);
			return data.SessionId;			
		}
		throw new restify.PreconditionFailedError('This instance has not deployed yet');
    },

	async deleteInstance(_id) {		
		const shellInstance = await exports.get(_id);
		if([exports.STATE.CREATED, exports.STATE.UNDEPLOYED, exports.STATE.DEPLOY_FAILED, exports.STATE.DELETE_FAILED].indexOf(shellInstance.status) !== -1) {
			const TestcaseService = require('./Testcase.service');
			const count = await TestcaseService.getTestcaseAvail(_id);
			if(count > 0) throw new restify.PreconditionFailedError(`Need remove ${count} testcase${count > 1 ? 's' : ''} in this instance before deleting`);

			await exports.updateStatus({
				_id: shellInstance._id,
				status: exports.STATE.DELETING
			});
			const ExecutingLogs = require('./ExecutingLogs.service');
			const rabSession = await ExecutingLogs.insert({
				event_type: ExecutingLogs.EVENT_TYPE.DELETE_INSTANCE,
				event_name: 'DELETE INSTANCE',
				status: ExecutingLogs.STATUS.RUNNING,
				title: shellInstance.input_data.name,
				shellinstance_id: shellInstance._id
			});
			const data = {
				SessionId: rabSession._id.toString(),
				Command: appconfig.rabbit.channel.deleteInstance.cmd,
				Params: {
					cloud_ip: appconfig.rabbit.cloud_ip,
					deployment_id: shellInstance.input_data.name,
				},
				From: appconfig.rabbit.api.queueName
			};
			const BroadcastService = require('./Broadcast.service');
			await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.deleteInstance.exchange, appconfig.rabbit.channel.deleteInstance.queueName, appconfig.rabbit.channel.deleteInstance.exchangeType, data);
			return data.SessionId;
		}
		throw new restify.PreconditionFailedError('This instance must be undeployed or created before deleting');
    },

	async find(fil = {}, dboReuse) {
		fil.where = exports.validate(fil.where, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(shellclass_id, dboReuse) {
		shellclass_id = exports.validate(shellclass_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.get(shellclass_id, dboType);
		return rs;
	},

	async updateStatus({_id, status}, dboReuse) {
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update({_id, status}, dboType);

		return rs;
	},

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dboReuse) {
		_id = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(shellclass_id, dboReuse) {
		_id = exports.validate(shellclass_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(shellclass_id, dboType);

		return rs;
	}

}