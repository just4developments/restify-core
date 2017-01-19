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
				item.input_date = utils.valid('input_date', item.input_date, Date);

				break;
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.icon = utils.valid('icon', item.icon, String);
				item.name = utils.valid('name', item.name, String);
				item.money = utils.valid('money', item.money, Number, 0);
				item.type = utils.valid('type', item.type, Number, 0);
				// item.input_date = utils.valid('input_date', item.input_date, Date);

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.icon = utils.valid('icon', item.icon, String);
				item.name = utils.valid('name', item.name, String);
				item.money = utils.valid('money', item.money, Number, 0);
				item.type = utils.valid('type', item.type, Number, 0);
				// item.input_date = utils.valid('input_date', item.input_date, Date);

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
			await exports.insert(e, auth, dbo, false);
			return e;
		});
		await dbo.close();
	},

	async transfer(trans, auth, dboReuse) {
		trans = exports.validate(trans, exports.VALIDATE.TRANSFER);
		if(trans.money <= 0) return true;

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
			const TypeSpendingService = require('./TypeSpendings.service');
			const SpendingService = require('./Spendings.service');
			const typeSpendings = await TypeSpendingService.find({where: {
				'type_spendings.name': {
					$in: ['Transfer to wallet', 'Received from wallet']
				},
				'type_spendings.type': 0
			}, sort: {
				_id: 1
			}}, auth, dbo);
			if(typeSpendings.length !== 2) throw `Not found typeSpending in ['Transfer to wallet', 'Received from wallet']`;
			await exports.update(fromWallet, auth, dbo);
			await exports.update(toWallet, auth, dbo);
			await SpendingService.insert({
				_id: db.uuid(),
				money: trans.money,
				des: ``, //`Before ${fromWallet.money + trans.money}. After ${fromWallet.money}`,
				type_spending_id: typeSpendings.find((e) => {
					return e.name === 'Transfer to wallet'
				})._id,
				sign_money: 0,
				wallet_money0: fromWallet.money + trans.money,
				wallet_money1: fromWallet.money,
				wallet_id: fromWallet._id,
				type: -1,
				input_date: trans.input_date,
				date: trans.input_date.getDate(),
				month: trans.input_date.getMonth(),
				year: trans.input_date.getFullYear()
			}, auth, dbo, false);
			await SpendingService.insert({
				_id: db.uuid(),
				money: trans.money,
				sign_money: 0,
				des: ``, // `Before ${toWallet.money - trans.money}. After ${toWallet.money}`,
				type_spending_id: typeSpendings.find((e) => {
					return e.name === 'Received from wallet'
				})._id,
				wallet_money0: toWallet.money - trans.money,
				wallet_money1: toWallet.money,
				wallet_id: toWallet._id,
				type: 1,
				input_date: trans.input_date,
				date: trans.input_date.getDate(),
				month: trans.input_date.getMonth(),
				year: trans.input_date.getFullYear()
			}, auth, dbo, false);
		}finally {
			await dbo.close();
		}
		return {};
	},

	async insert(item, auth, dboReuse, isAddSpending=true) {
		item = exports.validate(item, exports.VALIDATE.INSERT);
		let timeUpdate = isAddSpending ? _.clone(item.input_date) : null;
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const isApplyToSpending = _.clone(item.isApplyToSpending);
		const des = _.clone(item.des);
		delete item.isApplyToSpending;
		delete item.des;
		const rs = await dbo.manual(async(collection, dbo) => {
			const rs = await collection.update({
				user_id: auth.accountId
			}, {
				$push: {
					'wallets': item
				}
			});
			if(timeUpdate) {
				const TypeSpendingService = require('./TypeSpendings.service');
				const typeSpendings = await TypeSpendingService.find({where: {
					'type_spendings.name': 'Add new wallet',
					'type_spendings.type': 0
				}, sort: {
					_id: 1
				}}, auth, dbo);
				if(typeSpendings.length !== 1) throw `Not found typeSpending in ['Add new wallet']`;
				const SpendingService = require('./Spendings.service');
				await SpendingService.insert({
					_id: db.uuid(),
					money: item.money,
					sign_money: isApplyToSpending ? item.money : 0,
					des: des,
					type_spending_id: typeSpendings[0]._id,
					wallet_money0: 0,
					wallet_money1: item.money,
					wallet_id: item._id,
					type: isApplyToSpending ? (item.money >= 0 ? 1 : -1) : 0,
					input_date: timeUpdate,
					date: timeUpdate.getDate(),
					month: timeUpdate.getMonth(),
					year: timeUpdate.getFullYear()
				}, auth, dbo, false);
			}
			return item;
		}, dboType);
		return rs;
	},

	async update(item, auth, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);
		let timeUpdate;
		if(item.input_date) {
			timeUpdate = _.clone(item.input_date);
			delete item.input_date;
		}
		const isApplyToSpending = _.clone(item.isApplyToSpending);
		const des = _.clone(item.des);
		delete item.isApplyToSpending;
		delete item.des;
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.manual(async(collection, dbo) => {
			const old = await exports.get(item._id, auth, dbo);
			const rs = await collection.update({
				user_id: auth.accountId,
				"wallets._id": item._id
			}, {
				$set: {
					'wallets.$': item
				}
			});
			if(timeUpdate && item.money !== old.money) {
				const TypeSpendingService = require('./TypeSpendings.service');
				const typeSpendings = await TypeSpendingService.find({where: {
					'type_spendings.name': 'Update wallet',
					'type_spendings.type': 0
				}, sort: {
					_id: 1
				}}, auth, dbo);
				if(typeSpendings.length !== 1) throw `Not found typeSpending in ['Update wallet']`;
				const SpendingService = require('./Spendings.service');
				await SpendingService.insert({
					_id: db.uuid(),
					money: Math.abs(item.money - old.money),
					sign_money: isApplyToSpending ? (item.money - old.money) : 0,
					des: des,
					type_spending_id: typeSpendings[0]._id,
					wallet_money0: old.money,
					wallet_money1: item.money,
					wallet_id: item._id,
					type: isApplyToSpending ? (item.money - old.money >= 0 ? 1 : -1) : 0,
					input_date: timeUpdate,
					date: timeUpdate.getDate(),
					month: timeUpdate.getMonth(),
					year: timeUpdate.getFullYear()
				}, auth, dbo, false);
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