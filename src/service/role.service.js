const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const cachedService = require('./cached.service');

/************************************
 ** SERVICE:      roleController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:46:21 PM
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
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				if (utils.has(item.name)) item.name = utils.valid('name', item.name, String);
				if (utils.has(item.api)) item.api = utils.valid('api', item.api, Array);
				if (utils.has(item.api)) item.api.forEach((itemi, i) => {
					if (utils.has(item.api[i].path)) item.api[i].path = utils.valid('path', item.api[i].path, String);
					if (utils.has(item.api[i].actions)) item.api[i].actions = utils.valid('actions', item.api[i].actions, Array);
				});
				if (utils.has(item.web)) item.web = utils.valid('web', item.web, Array);
				if (utils.has(item.web)) item.web.forEach((itemi, i) => {
					if (utils.has(item.web[i].path)) item.web[i].path = utils.valid('path', item.web[i].path, String);
					if (utils.has(item.web[i].actions)) item.web[i].actions = utils.valid('actions', item.web[i].actions, Array);
				});
				if (utils.has(item.mob)) item.mob = utils.valid('mob', item.mob, Array);
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

	async getCached(projectId, cached){
		return await cached.get(`roles.${projectId}`);
	},

	async refeshCached(projectId, cached, dbo, isRemove){
		if(isRemove){
			await cached.del(`roles.${projectId}`);
		}else {
			const roles = await exports.find({
				where: { project_id: projectId }
			}, dbo);
			if(roles.length > 0) await cached.set(`roles.${projectId}`, roles);
			else await cached.del(`roles.${projectId}`);
		}
	},

	async find(fil = {}, dbo) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);		
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);		
		const rs = await dbo.get(_id, dboType);
		return rs;
	},

	async insert(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);		
		let cached;
		try {
			const rs = await dbo.insert(item, db.FAIL);
			cached = cachedService.open();
			await exports.refeshCached(item.project_id, cached, dbo);
			return rs;
		} finally {
			if(cached) await cached.close();
			if(dboType === db.DONE) await dbo.close();
		}
	},

	async update(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);		
		let cached;
		try{
			const rs = await dbo.update(item, db.FAIL);
			cached = cachedService.open();
			await exports.refeshCached(item.project_id, cached, dbo);
			return rs;
		} finally {			
			if(cached) await cached.close();
			if(dboType === db.DONE) await dbo.close();
		}
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);			
		let cached;
		try{
			const item = await exports.get(_id, dbo);
			const rs = await dbo.delete(_id, db.FAIL);
			cached = cachedService.open();			
			await exports.refeshCached(item.project_id, cached, dbo);
			return rs;
		} finally {			
			if(cached) await cached.close();
			if(dboType === db.DONE) await dbo.close();
		}
	}

}