const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ExpensiveNoteController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:32:25 PM
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
				item.user_id = db.uuid(utils.valid('user_id', item.user_id, [String, db.Uuid]));
				item.wallets = utils.valid('wallets', item.wallets, Array);
				item.wallets.forEach((itemi, i) => {
					item.wallets[i]._id = db.uuid();
					item.wallets[i].icon = utils.valid('icon', item.wallets[i].icon, String);
					item.wallets[i].name = utils.valid('name', item.wallets[i].name, String);
					item.wallets[i].money = utils.valid('money', item.wallets[i].money, Number, 0);
					item.wallets[i].type = utils.valid('type', item.wallets[i].type, Number, 0);
				});
				item.type_spendings = utils.valid('type_spendings', item.type_spendings, Array);
				item.type_spendings.forEach((itemi, i) => {
					item.type_spendings[i]._id = db.uuid();
					item.type_spendings[i].name = utils.valid('name', item.type_spendings[i].name, String);
					item.type_spendings[i].icon = utils.valid('icon', item.type_spendings[i].icon, String);
					item.type_spendings[i].type = utils.valid('type', item.type_spendings[i].type, Number);
				});
				item.spendings = utils.valid('spendings', item.spendings, Array);
				item.spendings.forEach((itemi, i) => {
					item.spendings[i]._id = db.uuid();
					item.spendings[i].money = utils.valid('money', item.spendings[i].money, Number, 0);
					item.spendings[i].input_date = utils.valid('input_date', item.spendings[i].input_date, Date);
					item.spendings[i].des = utils.valid('des', item.spendings[i].des, String);
					item.spendings[i].type_spending_id = db.uuid(utils.valid('type_spending_id', item.spendings[i].type_spending_id, [String, db.Uuid]));
					item.spendings[i].wallet_id = db.uuid(utils.valid('wallet_id', item.spendings[i].wallet_id, [String, db.Uuid]));
					item.spendings[i].is_bookmark = utils.valid('is_bookmark', item.spendings[i].is_bookmark, Boolean, false);
				});

				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.user_id = db.uuid(utils.valid('user_id', item.user_id, [String, db.Uuid]));
				item.wallets = utils.valid('wallets', item.wallets, Array);
				item.wallets.forEach((itemi, i) => {
					item.wallets[i]._id = db.uuid(utils.valid('_id', item.wallets[i]._id, [String, db.Uuid]));
					item.wallets[i].icon = utils.valid('icon', item.wallets[i].icon, String);
					item.wallets[i].name = utils.valid('name', item.wallets[i].name, String);
					item.wallets[i].money = utils.valid('money', item.wallets[i].money, Number, 0);
					item.wallets[i].type = utils.valid('type', item.wallets[i].type, Number, 0);
				});
				item.type_spendings = utils.valid('type_spendings', item.type_spendings, Array);
				item.type_spendings.forEach((itemi, i) => {
					item.type_spendings[i]._id = db.uuid(utils.valid('_id', item.type_spendings[i]._id, [String, db.Uuid]));
					item.type_spendings[i].name = utils.valid('name', item.type_spendings[i].name, String);
					item.type_spendings[i].icon = utils.valid('icon', item.type_spendings[i].icon, String);
					item.type_spendings[i].type = utils.valid('type', item.type_spendings[i].type, Number);
				});
				item.spendings = utils.valid('spendings', item.spendings, Array);
				item.spendings.forEach((itemi, i) => {
					item.spendings[i]._id = db.uuid(utils.valid('_id', item.spendings[i]._id, [String, db.Uuid]));
					item.spendings[i].money = utils.valid('money', item.spendings[i].money, Number, 0);
					item.spendings[i].input_date = utils.valid('input_date', item.spendings[i].input_date, Date);
					item.spendings[i].des = utils.valid('des', item.spendings[i].des, String);
					item.spendings[i].type_spending_id = db.uuid(utils.valid('type_spending_id', item.spendings[i].type_spending_id, [String, db.Uuid]));
					item.spendings[i].wallet_id = db.uuid(utils.valid('wallet_id', item.spendings[i].wallet_id, [String, db.Uuid]));
					item.spendings[i].is_bookmark = utils.valid('is_bookmark', item.spendings[i].is_bookmark, Boolean, false);
				});

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('user_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));
				item = db.uuid(utils.valid('user_id', item, [String, db.Uuid]));

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

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(_id, dboReuse) {
		item = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(_id, dboType);

		return rs;
	}

}