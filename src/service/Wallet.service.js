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
		TRANSFER: 5
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.TRANSFER: 
				item.from = db.uuid(utils.valid('from wallet id', item.from, [String, db.Uuid]));
				item.to = db.uuid(utils.valid('to wallet id', item.to, [String, db.Uuid]));
				item.money = utils.valid('money', item.money, Number);

				break;
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
			return rs && rs.wallets.length === 1 ? rs.wallets[0] : null;
		}, dboType);
		return rs;
	},

	async createDefaultData(auth, dboReuse){
		const dbo = await db.open(exports.COLLECTION);
		await [
			{name: 'Ví tiền', icon: [8, 9], type: 1, money: 0, oder: 1},
			{name: 'ATM', icon: [8, 6], type: 1, money: 0, oder: 2}, 
			{name: 'Tạm để giành', icon: [0, 11], type: 0, money: 0, oder: 3},
			{name: 'Tiền tiết kiệm', icon: [6, 3], type: 0, money: 0, oder: 4}
		].map(async (e) => {
			e.icon = `-${e.icon[0]*53}px -${e.icon[1]*64}px`;
			await exports.insert(e, auth, dbo);
			return e;
		});
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

	async transfer(trans, auth, dboReuse) {
		trans = exports.validate(trans, exports.VALIDATE.TRANSFER);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		try {
			let fromWallet = await exports.get(trans.from, auth, dbo);		
			if(!fromWallet) throw 'From wallet not found';
			let toWallet = await exports.get(trans.to, auth, dbo);
			if(!toWallet) throw 'To wallet not found';
			fromWallet.money -= trans.money;
			if(trans.money <= 0) throw 'Need money > 0';
			toWallet.money += trans.money;
			await exports.update(fromWallet, auth, dbo);
			await exports.update(toWallet, auth, dbo);
		}finally {
			await dbo.close();
		}
		return true;
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