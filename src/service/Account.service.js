const restify = require('restify');
const path = require('path');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "Project",
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
				item.password = utils.valid('password', item.password, String);
				item.status = utils.valid('status', item.status, Number, 0);
				item.email = utils.valid('email', item.email, String);
				item.birth_day = utils.valid('birth_day', item.birth_day, Date);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, String));
				item.status = utils.valid('status', item.status, Number, 0);
				item.email = utils.valid('email', item.email, String);
				item.birth_day = utils.valid('birth_day', item.birth_day, Date);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item._id = db.uuid(utils.valid('_id', item._id, String));

				break;
			case exports.VALIDATE.DELETE:
				item._id = db.uuid(utils.valid('_id', item._id, String));

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

	async insert(item, projectId, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);
		const projectService = require('./Project.service');
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		
		const account = await projectService.getAccount(projectId, item.username, dbo);
		if(account){
			throw 'Existed account';
		}
		item = await projectService.addAccount(projectId, item, dbo);
		await dbo.close();
		return item;
	},

	async login(username, password){
		try {
			// TODO: exports.validate(item, exports.VALIDATE.UPDATE_ROLE);
			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			roles = await dbo.manual(async (collection, dbo) => {
				await collection.find({
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

	async update(item, dboReuse) {
		try {
			exports.validate(item, exports.VALIDATE.UPDATE);

			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const oldItem = await dbo.get(item._id, db.FAIL);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			const rs = await dbo.update(item, dboType);

			utils.deleteFile(utils.getAbsoluteUpload(oldItem.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

			return rs;
		} catch (err) {
			utils.deleteFile(utils.getAbsoluteUpload(item.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

			throw err;
		}
	},

	async delete(_id, dboReuse) {
		exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const item = await dbo.get(_id, db.FAIL);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(_id, dboType);

		utils.deleteFile(utils.getAbsoluteUpload(item.avatar, path.join(__dirname, '..', '..', 'assets', 'avatar', '')), global.appconfig.app.imageResize.avatar);

		return rs;
	}

}