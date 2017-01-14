const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const SpendingsService = require('../service/Spendings.service');

/************************************
 ** CONTROLLER:   SpendingsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:36:13 PM
 *************************************/

server.put('/Sync/:email', utils.jsonHandler(), utils.auth('Common', 'SYNC'), async (req, res, next) => {
	
	try {
		let wallets = await require('../service/Wallet.service').find({where: {}}, req.auth);
		if(wallets.length === 0){
			let typeSpendings = await require('../service/TypeSpendings.service').find({where: {}}, req.auth);
			if(typeSpendings.length === 0){
				let spendings = await SpendingsService.find({where: {}}, req.auth);
				if(spendings.length === 0){
					let m = require('../service/Merge.service');
					await m(req.params.email);
					return res.send('Synced');
				}
			}
		}	
		res.send('Do nothing');	
	}catch(e){
		return next(e);
	}
	res.send('done');
});

server.get('/StatisticByMonth', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		let where = {
			"spendings.input_date": {
				$ne: 0
			},
			"spendings.is_monitor": 1
		};
		if(utils.has(req.query.startDate)===true || utils.has(req.query.endDate)===true){
			where["spendings.input_date"] = {};
			if(utils.has(req.query.startDate)===true) where["spendings.input_date"]["$gte"] = new Date(req.query.startDate);
			if(utils.has(req.query.endDate)===true) where["spendings.input_date"]["$lte"] = new Date(req.query.endDate);
		}	
		const rs = await SpendingsService.statisticByMonth(where, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/StatisticByTypeSpending', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		let where = {
			"spendings.is_monitor": 1
		};
		if(utils.has(req.query.type)) where['spendings.type'] = +req.query.type;
		else where["spendings.input_date"] = { $ne: 0 };
		if(utils.has(req.query.startDate)===true || utils.has(req.query.endDate)===true){
			where["spendings.input_date"] = {};
			if(utils.has(req.query.startDate)===true) where["spendings.input_date"]["$gte"] = new Date(req.query.startDate);
			if(utils.has(req.query.endDate)===true) where["spendings.input_date"]["$lte"] = new Date(req.query.endDate);
		}	
		const rs = await SpendingsService.statisticByTypeSpending(where, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});



server.get('/Spendings', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		let where = {};
		if(req.query.walletId) where['spendings.wallet_id'] = req.query.walletId;
		if(req.query.typeSpendingId) where['spendings.type_spending_id'] = req.query.typeSpendingId;
		if(utils.has(req.query.startDate)===true || utils.has(req.query.endDate)===true){
			where["spendings.input_date"] = {};
			if(utils.has(req.query.startDate)===true) where["spendings.input_date"]["$gte"] = new Date(req.query.startDate);
			if(utils.has(req.query.endDate)===true) where["spendings.input_date"]["$lte"] = new Date(req.query.endDate);
		}		
		const rs = await SpendingsService.find({
			where: where,
			sort: {
				input_date: -1
			}
		}, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/Spendings/:_id', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		const rs = await SpendingsService.get(req.params._id, rea.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/Spendings', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.money) === true) body.money = +req.body.money;
		if (utils.has(req.body.input_date) === true) body.input_date = utils.date(req.body.input_date);
		if (utils.has(req.body.des) === true) body.des = req.body.des;
		if (utils.has(req.body.type_spending_id) === true) body.type_spending_id = req.body.type_spending_id;
		if (utils.has(req.body.type) === true) body.type = req.body.type;
		if (utils.has(req.body.wallet_id) === true) body.wallet_id = req.body.wallet_id;
		if (utils.has(req.body.is_monitor) === true) body.is_monitor = utils.boolean(req.body.is_monitor);

		const rs = await SpendingsService.insert(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Spendings/:_id', utils.jsonHandler(), utils.auth('Spending', 'UPDATE'), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.money) === true) body.money = +req.body.money;
		if (utils.has(req.body.input_date) === true) body.input_date = utils.date(req.body.input_date);
		if (utils.has(req.body.des) === true) body.des = req.body.des;
		if (utils.has(req.body.type_spending_id) === true) body.type_spending_id = req.body.type_spending_id;
		if (utils.has(req.body.type) === true) body.type = req.body.type;
		if (utils.has(req.body.wallet_id) === true) body.wallet_id = req.body.wallet_id;
		if (utils.has(req.body.is_monitor) === true) body.is_monitor = utils.boolean(req.body.is_monitor);

		const rs = await SpendingsService.update(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Spendings/:_id', utils.jsonHandler(), utils.auth('Spending', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await SpendingsService.delete(req.params._id, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})