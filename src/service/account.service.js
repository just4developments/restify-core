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
			case exports.VALIDATE.AUTHORIZ:
				item.path = utils.valid('path', item.path, String);	
				item.actions = utils.valid('actions', item.actions, Array);	
				break;
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				item.role_ids = utils.valid('role_ids', item.role_ids, Array);				
				item.username = utils.valid('username', item.username, String);				
				item.status = utils.valid('status', item.status, Number, 0);
				item.recover_by = utils.valid('recover_by', item.recover_by, String);
				if(!item.more) item.more = {};
				else item.more = utils.valid('more', item.more, Object);
				if(item.app) item.app = utils.valid('app', item.app, String);
				else item.password = utils.valid('password', item.password, String);
				item.secret_key = db.uuid();
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
				if(!item.more) item.more = {};
				else item.more = utils.valid('more', item.more, Object);
				if(item.secret_key === true) item.secret_key = db.uuid();
				else delete item.secret_key;
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

	async authBySecretKey(secretKey){
		const cached = cachedService.open();
		let dbo;
		try {
			let user = await cached.get(`login.${secretKey}`);
			if(!user) {
				dbo = await db.open(exports.COLLECTION);
				user = await dbo.get({
					where: { secret_key: secretKey, status: exports.STATUS.ACTIVE },
					fields: { token: 1, status: 1, _id: 1, project_id: 1, role_ids: 1 }
				}, db.FAIL);
				if(!user) throw new restify.NotFoundError("Secret key is not correct");
				await cached.set(`login.${secretKey}`, user);
			}
			return `${user.project_id}-${user._id}-${secretKey}`;
		} finally {
			await cached.close();
			if(dbo) await dbo.close();
		}
	},

	async login(item = {}) {
		item = exports.validate(item, exports.VALIDATE.LOGIN);
		let where = {
			username: item.username,
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
				if(item.password) throw new restify.NotFoundError("Username or password is wrong");
				else throw new restify.NotFoundError("Username or login via social is wrong");
			}
			if(user.status !== exports.STATUS.ACTIVE) throw new restify.LockedError("You have not been actived yet");			
			const projectService = require('./project.service');
			cached = cachedService.open();
			const project = await projectService.getCached(user.project_id, cached);						
			if(project.plugins.oauthv2.single_mode) await cached.del(`login.${user.token}`);
			user.token = db.uuid();
			await dbo.update(user, db.FAIL);
			await cached.set(`login.${user.token}`, user, project.plugins.oauthv2.session_expired);
			return `${user.project_id}-${user._id}-${user.token}`;
		} finally {
			if(cached) await cached.close();
			await dbo.close();
		}
	},

	async authoriz(auth) {
		auth = exports.validate(auth, exports.VALIDATE.AUTHORIZ);
		const dbo = await db.open(exports.COLLECTION);
		const cached = cachedService.open();
		try {
			const user = await exports.getCached(auth.secretToken, cached);
			if(!user) throw new restify.UnauthorizedError('Session was expired');
			const roleService = require('./role.service');
			const roles = await roleService.getCached(auth.projectId, cached);
			for(let role of roles){
				for(let r of role.api) {
					if(new RegExp(`^${r.path}$`, 'gi').test(auth.path) && _.some(auth.actions, (a) => {
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
			const user = await exports.getCached(auth.secretToken, cached);
			if(!user) throw new restify.UnauthorizedError('Session was expired');
			const projectService = require('./project.service');
			const project = await projectService.getCached(user.project_id, cached);
			await cached.touch(`login.${auth.secretToken}`, project.plugins.oauthv2.session_expired);
		} finally {
			cached.close();
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
		try {
			const existedUser = await dbo.get({
				where: {
					username: item.username,
					project_id: item.project_id
				}
			}, db.FAIL);
			if(existedUser) throw new restify.BadRequestError(`User ${item.username} was existed`);
			const rs = await dbo.insert(item, db.FAIL);
			return rs;
		} finally {
			if(dboType === db.DONE) await dbo.close();
		}
	},

	async update(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);		
		let cached;
		try {
			let oldItem;
			if(item.secret_key) {
				oldItem = await exports.get(item._id);
			}
			const rs = await dbo.update(item, db.FAIL);
			if(oldItem) {
				cached = cachedService.open();
				await cached.del(`login.${oldItem.secret_key}`);
				const user = await exports.get({
					_id: item._id,
					fields: { token: 1, status: 1, _id: 1, project_id: 1, role_ids: 1 }
				}, db.FAIL);
				await cached.set(`login.${user.secret_key}`, item);
			}
			return rs;
		} finally {
			if(cached) await cached.close();
			if(dboType === db.DONE) await db.close();
		}
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		let cached;
		try {
			const oldItem = await exports.get(_id);			
			const rs = await dbo.delete(_id, db.FAIL);
			cached = cachedService.open();
			await cached.del(`login.${oldItem.secret_key}`);
			await cached.del(`login.${oldItem.token}`);
			return rs;
		} finally {
			if(cached) await cached.close();
			if(dboType === db.DONE) await db.close();
		}		
	}

}