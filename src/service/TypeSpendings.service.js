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
				item.uname = utils.toUnsign(item.name);
				item.icon = utils.valid('icon', item.icon, String);
				item.type = utils.valid('type', item.type, Number);
				if(item.parent_id) item.parent_id = db.uuid(item.parent_id);
				item.created_date = new Date();
				item.updated_date = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.name = utils.valid('name', item.name, String);
				item.uname = utils.toUnsign(item.name);
				item.icon = utils.valid('icon', item.icon, String);
				item.type = utils.valid('type', item.type, Number);
				if(item.parent_id) item.parent_id = db.uuid(item.parent_id);
				item.updated_date = new Date();

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
			}, {
				$match: fil.where
			},{
				$sort: fil.sort
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

	async createDefaultData(auth, dboReuse){
		const dbo = await db.open(exports.COLLECTION);
		for(e of [
			// Others
			{ oder: 1, name: 'Received from wallet', icon: [9, 11], type: 0},
			{ oder: 1, name: 'Transfer to wallet', icon: [6, 10], type: 0},
			{ oder: 1, name: 'Add new wallet', icon: [0, 10], type: 0},
			{ oder: 1, name: 'Update wallet', icon: [0, 10], type: 0},
			//Earning
			{ oder: 1, name: 'Lương', icon: [9, 2], type: 1,
				childs: [
					{ oder: 2, name: 'Thưởng', icon: [7, 9], type: 1 }
				] 
			},
			{ oder: 3, name: 'Bán hàng', icon: [10, 0], type: 1 },
			{ oder: 4, name: 'Được cho', icon: [6, 11], type: 1 },
			{ oder: 5, name: 'Tiền lãi', icon: [7, 11], type: 1 },
			{ oder: 100, name: 'Khoản thu khác', icon: [1, 4], type: 1 },
			// Spending
			{ oder: 1, name: 'Gia đình', icon: [9, 10], type: -1, 
				childs: [
					{ oder: 2, name: 'Con cái', icon: [10, 6], type: -1 }
				] 
			},
			{ oder: 3, name: 'Điện & nước & internet', icon: [12, 6], type: -1 },
			{ oder: 3, name: 'Ăn uống', icon: [1, 0], type: -1 },
			{ oder: 4, name: 'Bạn bè & người yêu', icon: [0, 0], type: -1 },
			{ oder: 5, name: 'Du lịch', icon: [11, 0], type: -1 },
			{ oder: 7, name: 'Giáo dục', icon: [7, 10], type: -1 },
			{ oder: 8, name: 'Mua sắm', icon: [2, 0], type: -1 },
			{ oder: 9, name: 'Y tế & Sức khoẻ', icon: [2, 11], type: -1 },
			{ oder: 10, name: 'Đi lại', icon: [1, 2], type: -1 },
			{ oder: 10, name: 'Cho vay', icon: [6, 10], type: -1 },
			{ oder: 100, name: 'Khoản chi phí khác', icon: [1, 4], type: -1 }
		]) {
			e.icon = `-${e.icon[0]*53}px -${e.icon[1]*64}px`;
			let d = _.cloneDeep(e);
			delete d.childs;
			let parent = await exports.insert(d, auth, dbo);
			if(e.childs) {
				for(e0 of e.childs) { 
					e0.icon = `-${e0.icon[0]*53}px -${e0.icon[1]*64}px`;
					e0.parent_id = parent._id;
					await exports.insert(e0, auth, dbo);
				}
			}
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
			const childs = await collection.count({
				user_id: auth.accountId,
				"type_spendings.parent_id": _id
			});
			if(childs > 0) throw new restify.BadRequestError("Need to remove all of childs before delete it");
			const refSpending = await collection.count({
				user_id: auth.accountId,
				"spendings.type_spending_id": _id
			});
			if(refSpending > 0) throw new restify.BadRequestError("Some items in spending is using it. Must remove it first");
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