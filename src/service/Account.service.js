const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const CachedService = require('./Cached.service');

/************************************
 ** SERVICE:      AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "Project",
	STATUS: {
		ACTIVE: 1,
		INACTIVE: 0
	},
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,

		UPDATE_ROLE: 5
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.username = utils.valid('username', item.username, String);
				if(!item.password && !item.app) item.password = utils.valid('password', item.password, String);	
				else if(item.password) item.password = utils.valid('password', item.password, String);
				else item.app = utils.valid('app', item.app, String);
				item.status = utils.valid('status', item.status, Number, 0);
				// item.recover_by = utils.valid('recover_by', item.recover_by, String);
				if(item.more) item.more = utils.valid('more', item.more, Object);
				item.roles = utils.valid('roles', item.roles, Array);
				if(item.roles.length === 0) throw new restify.BadRequestError(`roles is required`);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				// item.recover_by = utils.valid('recover_by', item.recover_by, String);
				if(item.status) item.status = utils.valid('status', item.status, Number);
				if(item.more) item.more = utils.valid('more', item.more, Object);
				if(item.old_password || item.password){
					if(item.old_password === item.password) {
						delete item.old_password;
						delete item.password;
					}
				}
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.projectId = db.uuid(utils.valid('projectId', item.projectId, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.projectId = db.uuid(utils.valid('projectId', item.projectId, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async getMe(auth, dboReuse) {
		if(!auth) throw new restify.NotAuthorizedError();
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				_id: auth.projectId,
				'accounts._id': auth.accountId
			}, {
				'accounts.$': 1,
			});
		}, dboType);
		const me = rs.accounts.length === 1 ? rs.accounts[0] : null;
		delete me.token;
		delete me.roles;
		delete me.password;
		delete me._id;
		return me;
	},

	async login(projectId, username, password, app){
		// TODO: exports.validate(item, exports.VALIDATE.UPDATE_ROLE);
		const dbo = await db.open(exports.COLLECTION);
		const user = await exports.verifyLogin(projectId, username, password, app);
		if(!user) throw new restify.BadRequestError("Username or password is wrong");
		if(user.status !== exports.STATUS.ACTIVE) throw new restify.BadRequestError("You have not been actived yet");
		return projectId + "-" + user._id + '-' + await dbo.manual(async (collection, dbo) => {
			const token = db.uuid();
			const rs = await collection.update({
				_id: db.uuid(projectId),
				'accounts._id': user._id,
			}, {
				$set: {
					'accounts.$.token': token
				}
			});
			if(rs.result.n > 0) {
				await exports.setAccountCached(token, user, user.token);
				return token;
			}
			throw new restify.BadRequestError("Something is wrong");
		});
	},

	async updateRole(projectId, accountId, roles, dboReuse) {
		try {
			// TODO: exports.validate(item, exports.VALIDATE.UPDATE_ROLE);

			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			roles = await dbo.manual(async (collection, dbo) => {
				await collection.update({
					_id: db.uuid(projectId),
					'accounts._id': db.uuid(accountId)
				}, {
					$set: {
						'accounts.$.roles': roles
					}
				}, false, true);
				return roles;
			});
			return roles;
		} catch (err) {
			throw err;
		}
	},

	async setAccountCached(token, account, oldToken){
		if(oldToken) await CachedService.del(`account.${oldToken}`);
		if(!account) account = await exports.getByToken(token);
		if(!account) throw new restify.BadRequestError('Token was changed');
		await CachedService.set(`account.${token}`, account, 1800);
		return account;
	},

	async getAccountCached(auth, isReload){
		let account = await CachedService.get(`account.${auth.token}`);
		if(!account) throw new restify.RequestTimeoutError('Not found account in cache');
		await CachedService.touch(`account.${auth.token}`, 1800);
		return account;
	},

	async authoriz(auth, path, actions){
		if(!auth) throw new restify.NotAuthorizedError();
		const projectService = require('./Project.service');
		const roles = await projectService.getRolesCached(auth.projectId);
		if(!roles) throw new restify.InternalServerError('Could not found the project');
		const acc = await exports.getAccountCached(auth);
		for(let accRole of acc.roles){
			const role = roles[accRole].api;
			if(!role) throw new restify.InternalServerError(`Not found ${accRole} in global roles`);
			for(let auth of role){
				if(new RegExp(auth.path, 'gi').test(path) && _.some(actions, (a) => {
					for(var auAction of auth.actions){
						if(new RegExp(auAction, 'gi').test(a)){
							return true;
						}
					}
					return false;
				})){
					return auth.actions;
				}
			}	
		}
		throw new restify.ForbiddenError('Not allow');
	},

	async getAuthoriz(auth, mode='web'){
		if(!auth) throw new restify.NotAuthorizedError();
		const projectService = require('./Project.service');
		const roles = await projectService.getRolesCached(auth.projectId);
		if(!roles) throw new restify.InternalServerError('Could not found the project');
		const acc = await exports.getAccountCached(auth);
		let accRoles = [];
		for(let accRole of acc.roles){
			const role = roles[accRole][mode];
			if(!role) throw new restify.InternalServerError(`Not found ${accRole} in global roles`);
			accRoles = accRoles.concat(role);			
		}
		return accRoles;
	},

	async getByToken(token) {
		const dbo = await db.open(exports.COLLECTION);
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				'accounts.token': db.uuid(token)
			}, {
				'accounts.$': 1
			});
		});
		return (rs && rs.accounts && rs.accounts.length === 1) ? rs.accounts[0] : null;
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(projectId0, _id0, dboReuse) {
		const {_id, projectId} = exports.validate({_id: _id0, projectId: projectId0}, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.findOne({
				_id: db.uuid(projectId),
				'accounts._id': _id
			}, {
				'accounts.$.roles': 1
			}, dboType);
		}, dboType);
		return rs.accounts.length === 1 ? rs.accounts[0] : null;
	},

	async verifyLogin(projectId, username, password, app){
		const dbo = await db.open(exports.COLLECTION);
		let where = {
			_id: db.uuid(projectId),
			'accounts.username': username,
			status: 1
		};
		const users = await dbo.find({where: where, fields: { 'accounts.$': 1} });
		if(users.length === 1 && users[0].accounts.length === 1) {
			const user = users[0].accounts[0];
			if(user.password && user.password === password) return user;	
			if(user.app) {
				if(new RegExp(user.app, 'g').test(app)) return user;
				throw new restify.BadRequestError("WRONG_APP");	
			}else {				
				throw new restify.BadRequestError("WRONG_PASS");					
			}
		}
		throw new restify.BadRequestError("NOT_EXISTED");
	},

	async getUserByUsername(projectId, username, password, app){
		const dbo = await db.open(exports.COLLECTION);
		let where = {
			_id: db.uuid(projectId),
			'accounts.username': username,
			status: 1
		};
		const user = await dbo.find({where: where, fields: { 'accounts.$': 1} });
		if(user.length === 1 && user[0].accounts.length === 1) return user[0].accounts[0];				
		return null;
	},

	async insert(item, projectId, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);
		const existedUser = await exports.getUserByUsername(projectId, item.username);
		if(existedUser) throw new restify.InternalServerError(`User ${item.username} was existed`);
		const projectService = require('./Project.service');
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		
		const account = await projectService.getAccount(projectId, item.username, dbo);
		if(account){
			throw 'Existed account';
		}
		const roles = await projectService.getRolesCached(projectId);
		item.roles = item.roles.map((roleId) => {
			for(let roleName in roles){
				if(roleId === roles[roleName]._id.toString()) return roleName;
			}
		});
		item.roles = _.reject(item.roles, function(val){ return _.isUndefined(val) });
		item = exports.validate(item, exports.VALIDATE.INSERT);
		item = await projectService.addAccount(projectId, item, dbo);
		await dbo.close();
		return item;
	},

	async update(item, auth, dboReuse) {
		item._id = auth.accountId;

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const old = await exports.get(auth.projectId, auth.accountId, dbo);

		if(item.password || item.old_password){
			if(old.password && item.old_password !== old.password) throw new restify.BadRequestError('Old password is not matched');
			delete item.old_password;					
		}

		item = _.merge({}, old, item);
		exports.validate(item, exports.VALIDATE.UPDATE);		

		const rs = await dbo.manual(async (collection, dbo) => {			
			return await collection.update({
				_id: auth.projectId,
				'accounts._id': auth.accountId
			}, {
				$set: {
					'accounts.$': item
				}
			});
		}, dboType);
		return item;
	},

	async delete(projectId0, _id0, dboReuse) {
		const {projectId, _id} = exports.validate({projectId: projectId0, _id: _id0}, exports.VALIDATE.DELETE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const item = await dbo.get(projectId, _id, db.FAIL);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			return await collection.update({
				_id: projectId,
			}, {
				$pull: {
					accounts: { 
						_id : _id 
					}
				}
			});
		}, dboType);

		// utils.deleteFile(utils.getAbsoluteUpload(item.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

		return rs;
	}

};