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
		UNBOOKMARK: 5
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.money = utils.valid('money', item.money, Number, 0);
				item.input_date = utils.valid('input_date', item.input_date, Date);
				item.des = utils.valid('des', item.des, String, '');
				item.udes = utils.toUnsign(item.des);
				item.type_spending_id = db.uuid(utils.valid('type_spending_id', item.type_spending_id, [String, db.Uuid]));
				item.wallet_id = db.uuid(utils.valid('wallet_id', item.wallet_id, [String, db.Uuid]));
				item.is_bookmark = utils.valid('is_bookmark', item.is_bookmark, Boolean, false);
				item.type = utils.valid('type', item.type, Number);
				item.date = item.input_date.getDate();
				item.month = item.input_date.getMonth();
				item.year = item.input_date.getFullYear();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.money = utils.valid('money', item.money, Number, 0);
				item.input_date = utils.valid('input_date', item.input_date, Date);
				item.des = utils.valid('des', item.des, String, '');
				item.udes = utils.toUnsign(item.des);
				item.type_spending_id = db.uuid(utils.valid('type_spending_id', item.type_spending_id, [String, db.Uuid]));
				item.wallet_id = db.uuid(utils.valid('wallet_id', item.wallet_id, [String, db.Uuid]));
				item.is_bookmark = utils.valid('is_bookmark', item.is_bookmark, Boolean, false);
				item.date = item.input_date.getDate();
				item.month = item.input_date.getMonth();
				item.year = item.input_date.getFullYear();
				item.type = utils.valid('type', item.type, Number);

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.UNBOOKMARK:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:
				if(item.where){
					if(item.where['spendings.wallet_id']) item.where['spendings.wallet_id'] = db.uuid(utils.valid('wallet_id', item.where['spendings.wallet_id'], [String, db.Uuid]));
					if(item.where['spendings.type_spending_id']) item.where['spendings.type_spending_id'] = db.uuid(utils.valid('type_spending_id', item.where['spendings.type_spending_id'], [String, db.Uuid]));
				}

				break;
		}
		return item;
	},

	async statisticByMonth(where, auth, dboReuse) {
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.aggregate([
			{ 
				$match: { user_id : auth.accountId } 
			}, { 
				$project: { _id: 0, spendings: 1 } 
			}, { 
				$unwind: "$spendings" 
			}, {
				$match: where
			}, {     
				$group : {         
					_id : { 
						month: "$spendings.month", 
						year: "$spendings.year"
					},         
					smoney: { 
						$sum: {
							$cond: [
								{$eq: ["$spendings.type", -1]}, 
								"$spendings.money",
								0
							]
						}
					},
					emoney:   { 
						$sum: {
							$cond: [
								{$eq: ["$spendings.type", 1]}, 
								"$spendings.money",
								0
							]
						}
					},   
				} 
			}]);
			return await rs.toArray();
		}, dboType);
		return rs;
	},

	async statisticByTypeSpending(where, auth, dboReuse) {
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.aggregate([
			{ 
				$match: {
					user_id: auth.accountId
				}
			}, { 
				$project: { _id: 0, spendings: 1 } 
			}, { 
				$unwind: "$spendings" 
			}, {
				$match: where
			},{     
				$group : {         
					_id : "$spendings.type_spending_id",         
					money: { $sum: "$spendings.money" }     
				} 
			}]);
			return await rs.toArray();
		}, dboType);
		return rs;
	},

	async createUser(auth, dboReuse){
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		try {
			const rs = await dbo.find({
				where: {user_id: auth.accountId }
			}, db.FAIL);
			if(rs.length === 0){
				return await dbo.insert({
					user_id: auth.accountId,
					spendings: [],
					wallets: [],
					type_spendings: []
				}, dboType);
			}
			return rs[0];
		}finally{
			await dbo.close();
		}
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
				$sort: {
					"spendings.input_date": -1
				}
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
			return rs.spendings.length === 1 ? rs.spendings[0] : null;
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
			if(item.money > 0){ // check them type ko thong ke
				const WalletService = require('./Wallet.service');
				const wallet = await WalletService.get(item.wallet_id, auth, dboReuse);
				wallet.money += item.money * item.type;
				await WalletService.update(wallet, auth, dboReuse);
			}
			return item;
		}, dboType);
		return rs;
	},
	
	async unbookmark(_id, auth, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.UNBOOKMARK);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.update({
				user_id: auth.accountId,
				"spendings._id": _id
			}, {
				$set: {
					'spendings.$': {
						is_bookmark: false
					}
				}
			});
			return rs;
		}, dboType);
		return rs;
	},

	async update(item, auth, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const oldItem = await exports.get(item._id, auth, dboReuse);
			if(!oldItem) throw new restify.NotFoundError('Not found');
			let moneyChangedWallet = 0;
			if(oldItem.money !== item.money){
				moneyChangedWallet = (item.money*item.type) - (oldItem.money*oldItem.type);
			}
			const rs = await collection.update({
				user_id: auth.accountId,
				"spendings._id": item._id
			}, {
				$set: {
					'spendings.$': item
				}
			});
			if(moneyChangedWallet !== 0){
				const WalletService = require('./Wallet.service');
				const wallet = await WalletService.get(item.wallet_id, auth, dboReuse);
				wallet.money += moneyChangedWallet;
				await WalletService.update(wallet, auth, dboReuse);
			}
			return item;
		}, dboType);
		return rs;
	},

	async delete(_id, auth, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const oldItem = await exports.get(_id, auth, dboReuse);
			if(!oldItem) throw new restify.NotFoundError('Not found');
			const rs = await collection.update({
				user_id: auth.accountId
			}, {
				$pull: {
					spendings: {
						_id
					}
				}
			});
			if(oldItem.money > 0){
				const WalletService = require('./Wallet.service');
				const wallet = await WalletService.get(oldItem.wallet_id, auth, dboReuse);
				wallet.money += oldItem.money*oldItem.type*-1;
				await WalletService.update(wallet, auth, dboReuse);
			}
			return _id;
		}, dboType);
		return rs;
	}

}