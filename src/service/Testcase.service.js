const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      TestcaseController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 5:19:44 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "Testcase",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	STATE: {
        CREATED: 1,
        TESTING: 2,
        TESTED: 3,
        TEST_FAILED: -3,
		DELETED: -4
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
				item.shellinstance_id = db.uuid(utils.valid('shellinstance_id', item.shellinstance_id, [String, db.Uuid]));
				item.params = utils.valid('params', item.params, Object);
				item.created_date = new Date();
				item.updated_date = new Date();
				item.status = exports.STATE.CREATED;

				break;
			case exports.VALIDATE.UPDATE:
				item.params = utils.valid('params', item.params, Object);
				item.updated_date = utils.valid('updated_date', item.updated_date, Date, new Date());

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async getTestcaseAvail(shellinstance_id){
		return await exports.find({count: true, where: {shellinstance_id, status: { $ne: exports.STATE.DELETED } }});
    },

	async run(_id){
		const testCase = await exports.get(_id);
		if(![exports.STATE.TESTING].includes(testCase.status)){
			await exports.updateStatus({
				_id,
				status: exports.STATE.TESTING
			});
			const ExecutingLogs = require('./ExecutingLogs.service');
			const rabSession = await ExecutingLogs.insert({
				event_type: ExecutingLogs.EVENT_TYPE.RUN_TESTCASE,
				status: ExecutingLogs.STATUS.RUNNING,
				title: testCase.params.name,
				event_name: "RUN TESTCASE",
				testcase_id: _id
			});

			const ShellInstanceService = require('./ShellInstance.service');
			const ShellClassService = require('./ShellClass.service');

			const shellInstance = await ShellInstanceService.get(testCase.shellinstance_id);		
			const shellClass = await ShellClassService.get(shellInstance.shellclass_id);
			const data = {
				SessionId: rabSession._id.toString(),				
				Command: appconfig.rabbit.channel.runTesting.cmd,
				Params: {
					cloud_ip: appconfig.rabbit.cloud_ip,
					blueprint_id: shellClass.name,
					deployment_id: shellInstance.input_data.name,
					tasks: shellClass.testing.tasks,
					params: testCase.params,
					instance_data: shellInstance.input_data
				},
				From: appconfig.rabbit.api.queueName
			};
			const BroadcastService = require('./Broadcast.service');
			await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.runTesting.queueName, data);
			let logInfo = {};
			for(let i in shellClass.testing.tasks){
				const task = shellClass.testing.tasks[i];
				let logs = task.log;
				if(logs && logs.length > 0){
					logInfo[task.name] = logs.map((e) => {
						return {
							id: e.id,
							title: e.name
						}
					});
				}
			}
			return {
				logInfo: logInfo,
				sessionId: data.SessionId
			};
		}
		throw new restify.PreconditionFailedError('This testcase is running');
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.get(_id, dboType);
		return rs;
	},

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async updateStatus({_id, status}, dboReuse) {
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update({_id, status}, dboType);
		return rs;
	},

	async update(item, dboReuse) {
		_id = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(_id, dboType);

		return rs;
	}

}