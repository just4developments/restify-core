const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      accountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:35:57 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "account",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				item.role_ids = utils.valid('role_ids', item.role_ids, Array);
				item.app = utils.valid('app', item.app, String);
				item.username = utils.valid('username', item.username, String);
				item.password = utils.valid('password', item.password, String);
				item.status = utils.valid('status', item.status, Number, 0);
				item.recover_by = utils.valid('recover_by', item.recover_by, String);
				item.more = utils.valid('more', item.more, Object);
				if (utils.has(item.token)) item.token = utils.valid('token', item.token, db.Uuid);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				if (utils.has(item.project_id)) item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				if (utils.has(item.role_ids)) item.role_ids = utils.valid('role_ids', item.role_ids, Array);
				if (utils.has(item.app)) item.app = utils.valid('app', item.app, String);
				if (utils.has(item.username)) item.username = utils.valid('username', item.username, String);
				if (utils.has(item.password)) item.password = utils.valid('password', item.password, String);
				item.status = utils.valid('status', item.status, Number, 0);
				if (utils.has(item.recover_by)) item.recover_by = utils.valid('recover_by', item.recover_by, String);
				if (utils.has(item.more)) item.more = utils.valid('more', item.more, Object);
				if (utils.has(item.token)) item.token = utils.valid('token', item.token, db.Uuid);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item = utils.valid('_id', item, db.Uuid);

				break;
			case exports.VALIDATE.DELETE:
				item = utils.valid('_id', item, db.Uuid);

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

	async update(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

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