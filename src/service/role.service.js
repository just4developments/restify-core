const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      roleController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:35:57 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "role",
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
				item.name = utils.valid('name', item.name, String);
				item.api = utils.valid('api', item.api, Array, []);
				if (utils.has(item.api)) item.api.forEach((itemi, i) => {
					if (utils.has(item.api[i].path)) item.api[i].path = utils.valid('path', item.api[i].path, String);
					if (utils.has(item.api[i].actions)) item.api[i].actions = utils.valid('actions', item.api[i].actions, Array);
				});
				item.web = utils.valid('web', item.web, Array, []);
				if (utils.has(item.web)) item.web.forEach((itemi, i) => {
					if (utils.has(item.web[i].path)) item.web[i].path = utils.valid('path', item.web[i].path, String);
					if (utils.has(item.web[i].actions)) item.web[i].actions = utils.valid('actions', item.web[i].actions, Array);
				});
				item.mob = utils.valid('mob', item.mob, Array, []);
				if (utils.has(item.mob)) item.mob.forEach((itemi, i) => {
					if (utils.has(item.mob[i].path)) item.mob[i].path = utils.valid('path', item.mob[i].path, String);
					if (utils.has(item.mob[i].actions)) item.mob[i].actions = utils.valid('actions', item.mob[i].actions, Array);
				});
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				if (utils.has(item.project_id)) item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				if (utils.has(item.name)) item.name = utils.valid('name', item.name, String);
				item.api = utils.valid('api', item.api, Array, []);
				if (utils.has(item.api)) item.api.forEach((itemi, i) => {
					if (utils.has(item.api[i].path)) item.api[i].path = utils.valid('path', item.api[i].path, String);
					if (utils.has(item.api[i].actions)) item.api[i].actions = utils.valid('actions', item.api[i].actions, Array);
				});
				item.web = utils.valid('web', item.web, Array, []);
				if (utils.has(item.web)) item.web.forEach((itemi, i) => {
					if (utils.has(item.web[i].path)) item.web[i].path = utils.valid('path', item.web[i].path, String);
					if (utils.has(item.web[i].actions)) item.web[i].actions = utils.valid('actions', item.web[i].actions, Array);
				});
				item.mob = utils.valid('mob', item.mob, Array, []);
				if (utils.has(item.mob)) item.mob.forEach((itemi, i) => {
					if (utils.has(item.mob[i].path)) item.mob[i].path = utils.valid('path', item.mob[i].path, String);
					if (utils.has(item.mob[i].actions)) item.mob[i].actions = utils.valid('actions', item.mob[i].actions, Array);
				});
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