const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const cachedService = require('./cached.service');

/************************************
 ** SERVICE:      accountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:46:21 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "account",
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
		ACTIVE: 1,
		INACTIVE: 0
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.LOGIN:
				item.username = utils.valid('username', item.username, String);	
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				if(item.app) item.app = utils.valid('app', item.app, String);
				else item.password = utils.valid('password', item.password, String);
				break;
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				item.role_ids = utils.valid('role_ids', item.role_ids, Array);				
				item.username = utils.valid('username', item.username, String);				
				item.status = utils.valid('status', item.status, Number, 0);
				item.recover_by = utils.valid('recover_by', item.recover_by, String);
				item.more = utils.valid('more', item.more, Object);
				if(item.app) item.app = utils.valid('app', item.app, String);
				else item.password = utils.valid('password', item.password, String);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				if (utils.has(item.role_ids)) item.role_ids = utils.valid('role_ids', item.role_ids, Array);
				if (utils.has(item.app)) item.app = utils.valid('app', item.app, String);
				if (utils.has(item.password)) item.password = utils.valid('password', item.password, String);
				if (utils.has(item.status)) item.status = utils.valid('status', item.status, Number);
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

	async getCached(token, cached){
		return await cached.get(`login.${token}`);
	},

	async login(item = {}) {
		item = exports.validate(item, exports.VALIDATE.LOGIN);
		let where = {
			username: item.username,
			status: exports.STATUS.ACTIVE,
			project_id: item.project_id
		};
		if(item.password) where.password = item.password;
		else where.app = item.app;
		const dbo = await db.open(exports.COLLECTION);
		let cached;
		try {
			const user = await dbo.get({
				where,
				fields: { token: 1, status: 1, _id: 1, project_id: 1, role_ids: 1 }
			}, db.FAIL);
			if(!user) {
				if(item.password) throw new restify.BadRequestError("Username or password is wrong");
				else throw new restify.BadRequestError("Username or login via social is wrong");
			}
			if(user.status !== exports.STATUS.ACTIVE) throw new restify.BadRequestError("You have not been actived yet");			
			const configService = require('./config.service');
			cached = cachedService.open();
			const config = await configService.getCached(user.project_id, cached);						
			if(config.single_mode) await cached.del(`login.${user.token}`);
			user.token = db.uuid();
			await dbo.update(user, db.FAIL);
			await cached.set(`login.${user.token}`, user, config.session_expired);
			return `${user.project_id}-${user._id}-${user.token}`;
		} finally {
			if(cached) await cached.close();
			await dbo.close();
		}
	},

	async authoriz(auth, path, actions) {
		if(!(actions instanceof Array)) actions = actions.split(',');
		const dbo = await db.open(exports.COLLECTION);
		const cached = cachedService.open();
		try {
			const user = await exports.getCached(auth.token, cached);
			if(!user) throw new restify.BadRequestError("Could not authentication");
			const rolesService = require('./role.service');
			const roles = await rolesService.getCached(auth.projectId, cached);
			for(let role of roles){
				for(let r of role.api) {
					if(new RegExp(`^${r.path}$`, 'gi').test(path) && _.some(actions, (a) => {
						for(var auAction of r.actions){
							if(new RegExp(`^${auAction}$`, 'gi').test(a)){
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
			await cached.close();
			await dbo.close();
		}
	},

	async ping(auth) {
		const cached = cachedService.open();
		try {
			const user = await exports.getCached(auth.token, cached);
			if(!user) throw new restify.BadRequestError('Session was expired');
			const configService = require('./config.service');
			const config = await configService.getInCached(user.project_id, cached);			
			await cached.touch(`login.${user.token}`, config.session_expired);
		} finally {
			cached.close();
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
				username: item.username,
				project_id: item.project_id
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