const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      projectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/7/2017, 2:39:22 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "project",
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
				item.name = utils.valid('name', item.name, String);
				item.status = utils.valid('status', item.status, Number, 0);
				item.plugins = utils.valid('plugins', item.plugins, Object);
				if (item.plugins) {
					item.plugins.oauthv2 = utils.valid('oauthv2', item.plugins.oauthv2, Object);
					if (item.plugins.oauthv2) {
						item.plugins.oauthv2._id = db.uuid();
						item.plugins.oauthv2.single_mode = utils.valid('single_mode', item.plugins.oauthv2.single_mode, Boolean);
						item.plugins.oauthv2.session_expired = utils.valid('session_expired', item.plugins.oauthv2.session_expired, Number);
					}
				}
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				if (utils.has(item.name)) item.name = utils.valid('name', item.name, String);
				if (utils.has(item.status)) item.status = utils.valid('status', item.status, Number);
				if (utils.has(item.plugins)) item.plugins = utils.valid('plugins', item.plugins, Object);
				if (item.plugins) {
					if (utils.has(item.plugins.oauthv2)) item.plugins.oauthv2 = utils.valid('oauthv2', item.plugins.oauthv2, Object);
					if (item.plugins.oauthv2) {
						if (utils.has(item.plugins.oauthv2.single_mode)) item.plugins.oauthv2.single_mode = utils.valid('single_mode', item.plugins.oauthv2.single_mode, Boolean);
						if (utils.has(item.plugins.oauthv2.session_expired)) item.plugins.oauthv2.session_expired = utils.valid('session_expired', item.plugins.oauthv2.session_expired, Number);
					}
				}
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
		return await cached.get(`project.${projectId}`);
	},

	async refeshCached(projectId, project, cached, dbo) {
		const roleService = require('./role.service');
		if(project) {
			await cached.set(`project.${projectId}`, project);			
			await roleService.refeshCached(projectId, cached, dbo, false);	
		}else {
			await cached.del(`project.${projectId}`);
			await roleService.refeshCached(projectId, cached, dbo, true);	
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
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.delete(_id, dboType);

		return rs;
	}

}