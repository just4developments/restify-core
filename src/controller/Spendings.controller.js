const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const SpendingsService = require('../service/Spendings.service');

/************************************
 ** CONTROLLER:   SpendingsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:36:13 PM
 *************************************/

server.get('/Spendings', utils.jsonHandler(), utils.auth('Spending', 'ADD'), async(req, res, next) => {
	try {
		let where = {};
		if(req.query.walletId){
			where['spendings.wallet_id'] = req.query.walletId;
		}
		if(req.query.month && req.query.year){
			where['spendings.month'] = +req.query.month;
			where['spendings.year'] = +req.query.year;
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