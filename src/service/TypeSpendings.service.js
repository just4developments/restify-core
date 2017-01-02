const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      TypeSpendingsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/31/2016, 12:17:47 AM
 *************************************/

exports = module.exports = {
	COLLECTION: "ExpensiveNote",
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
				item.icon = utils.valid('icon', item.icon, String);
				item.type = utils.valid('type', item.type, Number);
				if(item.parent_id) utils.valid('parent_id', item.parent_id, [String, db.Uuid]);

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.name = utils.valid('name', item.name, String);
				item.icon = utils.valid('icon', item.icon, String);
				item.type = utils.valid('type', item.type, Number);
				if(item.parent_id) utils.valid('parent_id', item.parent_id, [String, db.Uuid]);

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async find(fil = {}, auth, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.aggregate([{
				$match: {
					"user_id": auth.accountId
				}
			}, {
				$unwind: '$type_spendings'
			}, {
				$project: {
					_id: 0,
					"type_spendings": 1
				}
			}]).map((e) => {
				return e.type_spendings;
			});
			return await rs.toArray()
		}, dboType);
		return rs;
	},

	async get(_id, auth, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.findOne({
				user_id: auth.accountId,
				"type_spendings._id": _id
			}, {'type_spendings.$': 1, _id: 0});
			return rs.type_spendings.length === 1 ? rs.type_spendings[0] : null;
		}, dboType);
		return rs;
	},

	async insert(item, auth, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.update({
				user_id: auth.accountId
			}, {
				$push: {
					'type_spendings': item
				}
			});
			return item;
		}, dboType);
		return rs;
	},

	async update(item, auth, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.update({
				user_id: auth.accountId,
				"type_spendings._id": item._id
			}, {
				$set: {
					'type_spendings.$': item
				}
			});
			return item;
		}, dboType);
		return rs;
	},

	async delete(_id, auth, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.update({
				user_id: auth.accountId
			}, {
				$pull: {
					type_spendings: {
						_id
					}
				}
			});
			return _id;
		}, dboType);
		return rs;
	}

}