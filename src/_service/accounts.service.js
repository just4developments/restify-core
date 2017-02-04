const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const cachedService = require('./cached.service');

/************************************
 ** SERVICE:      accountsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/3/2017, 10:00:34 AM
 *************************************/

exports = module.exports = {
	COLLECTION: "accounts",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
		LOGIN: 5,
		AUTHORIZ: 6
	},
	STATUS: {
		ACTIVED: 1,
		INACTIVED: 0
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.LOGIN:
				item.project_id = db.uuid(utils.valid('project_id', item.project_id, [String, db.Uuid]));
				item.username = utils.valid('username', item.username, String);
				if(item.app) {
					item.app = utils.valid('app', item.app, String);
					delete item.password;
				}else {					
					item.password = utils.valid('password', item.password, String);
				}
				
				break;
			case exports.VALIDATE.INSERT:
				item.project_id = db.uuid(utils.valid('project_id', item.project_id, [String, db.Uuid]));
				item.role_ids = db.uuid(utils.valid('role_ids', item.role_ids, Array));
				item.username = utils.valid('username', item.username, String);
				item.password = utils.valid('password', item.password, String);
				item.status = utils.valid('status', item.status, Number, 0);
				item.recover_by = utils.valid('recover_by', item.recover_by, String);
				item.more = utils.valid('more', item.more, Object);

				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				if(item.project_id) item.project_id = db.uuid(utils.valid('project_id', item.project_id, [String, db.Uuid]));
				if(item.role_ids) item.role_ids = db.uuid(utils.valid('role_ids', item.role_ids, Array));
				if(item.username) item.username = utils.valid('username', item.username, String);
				if(item.password) item.password = utils.valid('password', item.password, String);
				if(item.status) item.status = utils.valid('status', item.status, Number, 0);
				if(item.recover_by) item.recover_by = utils.valid('recover_by', item.recover_by, String);
				if(item.more) item.more = utils.valid('more', item.more, Object);

				item.updated_at = new Date();

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

	async getInCached(token){
		return await cachedService.open().get(`login.${token}`);
	},

	async ping(token) {
		const cached = cachedService.open(true);
		const user = await cached.get(`login.${token}`);
		if(!user) {
			cached.close();
			throw new restify.BadRequestError('Session was expired');
		}
		const projectService = require('./project.service');
		const project = await projectService.getInCached(user.project_id);			
		await cached.set(`login.${user.token}`, user, project.config.session_expired);
		cached.close();
	},

	async login(item = {}) {
		item = exports.validate(item, exports.VALIDATE.LOGIN);
		const dbo = await db.open(exports.COLLECTION);
		let where = {
			username: item.username
		};
		if(item.password) where.password = item.password
		else where.app = item.app
		const user = await dbo.get({
			where,
			fields: { token: 1, status: 1, _id: 1, project_id: 1, role_ids: 1 }
		}, db.FAIL);
		let cached;
		try {
			if(!user) {
				if(item.password) throw new restify.BadRequestError("Username or password is wrong");
				else throw new restify.BadRequestError("Username or app is wrong");
			}
			if(user.status !== exports.STATUS.ACTIVED) throw new restify.BadRequestError("You have not been actived yet");			
			const projectService = require('./project.service');
			const project = await projectService.getInCached(user.project_id);			
			cached = cachedService.open(true);
			if(project.config.single_mode) await cached.del(`login.${user.token}`);
			user.token = db.uuid();
			await dbo.update(user, db.FAIL);
			await cached.set(`login.${user.token}`, user, project.config.session_expired);
			return `${user.project_id}-${user._id}-${user.token}`;
		} finally {
			if(cached) await cached.close();
			await dbo.close();
		}
	},

	async authoriz(auth, path, actions) {
		if(!(actions instanceof Array)) actions = [actions];
		const dbo = await db.open(exports.COLLECTION);
		try {
			const user = await exports.getInCached(auth.token);
			if(!user) throw new restify.BadRequestError("Could not authentication");
			const rolesService = require('./roles.service');
			const roles = await rolesService.getInCached(auth.projectId);
			for(let role of roles){
				for(let r of role.api) {
					if(new RegExp(r.path, 'gi').test(path) && _.some(actions, (a) => {
						for(var auAction of r.actions){
							if(new RegExp(auAction, 'gi').test(a)){
								return true;
							}
						}
						return false;
					})){
						return;
					}
				}
			}	
			throw new restify.ForbiddenError('Not allow');
		} finally {
			await dbo.close();
		}
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
		const existedUser = await dbo.get({
			where: {
				username: item.username
			}
		}, db.FAIL);
		if(existedUser) {
			await dbo.close();
			throw new restify.BadRequestError(`User ${item.username} was existed`);			
		}
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