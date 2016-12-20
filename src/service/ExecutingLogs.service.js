const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ExecutingLogsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 2:42:21 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "ExecutingLogs",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	EVENT_TYPE: {
        UPLOAD_PLUGIN: 0,
        DELETE_PLUGIN: 0,
        CREATE_INSTANCE: 1,
        DELETE_INSTANCE: -1,
        DEPLOY_INSTANCE: 2, // 
        UNDEPLOY_INSTANCE: -2, 
        GET_INFORMATION: 3,
        RESTART_INSTANCE: 4,
        RUN_TESTCASE: 5
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
				if(item.shellclass_id) item.shellclass_id = db.uuid(item.shellclass_id);
				if(item.shellinstance_id) item.shellinstance_id = db.uuid(item.shellinstance_id);
				item.event_type = utils.valid('event_type', item.event_type, Number);
				item.status = utils.valid('status', item.status, Number);
				item.title = utils.valid('title', item.title, String);
				item.started_time = utils.valid('started_time', item.started_time, Date, new Date());

				break;
			case exports.VALIDATE.UPDATE:
				if(item.shellclass_id) item.shellclass_id = db.uuid(item.shellclass_id);
				if(item.shellinstance_id) item.shellinstance_id = db.uuid(item.shellinstance_id);
				item.event_type = utils.valid('event_type', item.event_type, Number);
				item.status = utils.valid('status', item.status, Number);
				item.title = utils.valid('title', item.title, String);
				item.started_time = utils.valid('started_time', item.started_time, Date, new Date());

				break;
			case exports.VALIDATE.GET:
				item.shellclass_id = db.uuid(utils.valid('shellclass_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item.shellclass_id = db.uuid(utils.valid('shellclass_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

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

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dboReuse) {
		exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(shellclass_id, dboReuse) {
		exports.validate(shellclass_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(shellclass_id, dboType);

		return rs;
	}

}