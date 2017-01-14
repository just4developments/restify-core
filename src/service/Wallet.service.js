const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      WalletController
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
				item.icon = utils.valid('icon', item.icon, String);
				item.name = utils.valid('name', item.name, String);
				item.money = utils.valid('money', item.money, Number, 0);
				item.type = utils.valid('type', item.type, Number, 0);

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.icon = utils.valid('icon', item.icon, String);
				item.name = utils.valid('name', item.name, String);
				item.money = utils.valid('money', item.money, Number, 0);
				item.type = utils.valid('type', item.type, Number, 0);

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
				$unwind: '$wallets'
			}, {
				$project: {
					_id: 0,
					"wallets": 1
				}
			}, {
				$match: fil.where
			}, {
				$sort: fil.sort
			}]).map((e) => {
				return e.wallets;
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
				"wallets._id": _id
			}, {'wallets.$': 1, _id: 0});
			return rs.wallets.length === 1 ? rs.wallets[0] : null;
		}, dboType);
		return rs;
	},

	async createDefaultData(auth, dboReuse){
		var data = [
			{name: 'Ví tiền', icon: [8, 9], avail: 1, money: 0, symb: 'VND', oder: 1},
			{name: 'ATM', icon: [8, 6], avail: 1, money: 0, symb: 'VND', oder: 2}, 
			{name: 'Tạm để giành', icon: [0, 11], avail: 0, money: 0, symb: 'VND', oder: 3},
			{name: 'Tiền tiết kiệm', icon: [6, 3], avail: 0, money: 0, symb: 'VND', oder: 4}
		].map((e) => {
			e.icon = `-${e.icon[0]*53}px -${e.icon[1]*64}px`;
			return e;
		});
		const dbo = await db.open(exports.COLLECTION);
		for(let d of data.map){
			await insert(d, auth, dbo);
		}
		await dbo.close();
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
					'wallets': item
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
				"wallets._id": item._id
			}, {
				$set: {
					'wallets.$': item
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
			const refSpending = await collection.count({
				user_id: auth.accountId,
				"spendings.wallet_id": _id
			});
			if(refSpending > 0) throw new restify.BadRequestError("Some items in spending is using it. Must remove it first");
			const rs = await collection.update({
				user_id: auth.accountId
			}, {
				$pull: {
					wallets: {
						_id
					}
				}
			});
			return _id;
		}, dboType);
		return rs;
	}

}