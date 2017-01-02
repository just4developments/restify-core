const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      SpendingsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:36:13 PM
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
				item.money = utils.valid('money', item.money, Number, 0);
				item.input_date = utils.valid('input_date', item.input_date, Date);
				item.des = utils.valid('des', item.des, String);
				item.type_spending_id = db.uuid(utils.valid('type_spending_id', item.type_spending_id, [String, db.Uuid]));
				item.wallet_id = db.uuid(utils.valid('wallet_id', item.wallet_id, [String, db.Uuid]));
				item.is_monitor = utils.valid('is_monitor', item.is_monitor, Boolean, false);
				item.date = item.input_date.getDate();
				item.month = item.input_date.getMonth();
				item.year = item.input_date.getFullYear();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.money = utils.valid('money', item.money, Number, 0);
				item.input_date = utils.valid('input_date', item.input_date, Date);
				item.des = utils.valid('des', item.des, String);
				item.type_spending_id = db.uuid(utils.valid('type_spending_id', item.type_spending_id, [String, db.Uuid]));
				item.wallet_id = db.uuid(utils.valid('wallet_id', item.wallet_id, [String, db.Uuid]));
				item.is_monitor = utils.valid('is_monitor', item.is_monitor, Boolean, false);
				item.date = item.input_date.getDate();
				item.month = item.input_date.getMonth();
				item.year = item.input_date.getFullYear();

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('type_spending_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('wallet_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('type_spending_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('wallet_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:
				if(item.where && item.where['spendings.wallet_id'])
					item.where['spendings.wallet_id'] = db.uuid(utils.valid('wallet_id', item.where['spendings.wallet_id'], [String, db.Uuid]));

				break;
		}
		return item;
	},

	async find(fil = {}, auth, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);
		fil.where.user_id = auth.accountId;
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.aggregate([{
				$match: {
					"user_id": auth.accountId
				}
			}, {
				$unwind: '$spendings'
			}, {
				$match: fil.where
			}, {
				$project: {
					_id: 0,
					"spendings": 1
				}
			}]).map((e) => {
				return e.spendings;
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
				"spendings._id": _id
			}, {'spendings.$': 1, _id: 0});
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
					'spendings': item
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
				"spendings._id": item._id
			}, {
				$set: {
					'spendings.$': item
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
					spendings: {
						_id
					}
				}
			});
			return _id;
		}, dboType);
		return rs;
	}

}