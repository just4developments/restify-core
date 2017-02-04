const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const cachedService = require('./cached.service');

/************************************
 ** SERVICE:      rolesController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/3/2017, 11:34:16 AM
 *************************************/

exports = module.exports = {
	COLLECTION: "roles",
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
				item.project_id = db.uuid(utils.valid('project_id', item.project_id, [String, db.Uuid]));
				item.name = utils.valid('name', item.name, String);
				item.api = utils.valid('api', item.api, Array);
				item.web = utils.valid('web', item.web, Array);
				item.api.forEach((itemi, i) => {
					item.api[i].path = utils.valid('path', item.api[i].path, String);
					item.api[i].actions = utils.valid('actions', item.api[i].actions, Array);
				});

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				if(item.project_id) item.project_id = db.uuid(utils.valid('project_id', item.project_id, [String, db.Uuid]));
				if(item.name) item.name = utils.valid('name', item.name, String);
				if(item.api) {
					item.api = utils.valid('api', item.api, Array);
					item.api.forEach((itemi, i) => {
						item.api[i].path = utils.valid('path', item.api[i].path, String);
						item.api[i].actions = utils.valid('actions', item.api[i].actions, Array);
					});
				}
				if(item.web) {
					item.web = utils.valid('web', item.web, Array);
					item.web.forEach((itemi, i) => {
						item.web[i].path = utils.valid('path', item.web[i].path, String);
						item.web[i].actions = utils.valid('actions', item.web[i].actions, Array);
					});
				}

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:
				item.where.project_id = db.uuid(utils.valid('project_id', item.where.project_id, [String, db.Uuid]));

				break;
		}
		return item;
	},

	async getInCached(projectId){
		return await cachedService.open().get(`roles.${projectId}`);
	},

	async fetchInCached(projectId){
		const roles = await exports.find({
			where: {
				project_id: projectId
			}
		});
		await cachedService.open().set(`roles.${projectId}`, roles);
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
		await exports.fetchInCached(item.project_id);
		return rs;
	},

	async update(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		try {						
			const oldItem = await dbo.get(item._id, db.FAIL);
			if(!oldItem) throw new restify.BadRequestError('Could not found');
			const rs = await dbo.update(item, dboType, db.FAIL);
			await exports.fetchInCached(oldItem.project_id);
			return rs;	
		} finally {
			await db0.close();
		}		
	},

	async delete(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const oldItem = await dbo.get(_id);
		if(!oldItem) throw new restify.BadRequestError('Could not found');
		const rs = await dbo.delete(_id, dboType);
		await exports.fetchInCached(oldItem.project_id);
		return rs;
	}

}