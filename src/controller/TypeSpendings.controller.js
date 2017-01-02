const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const TypeSpendingsService = require('../service/TypeSpendings.service');

/************************************
 ** CONTROLLER:   TypeSpendingsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/31/2016, 12:17:47 AM
 *************************************/

server.get('/TypeSpendings', utils.jsonHandler(), utils.auth('TypeSpending', 'FIND'), async(req, res, next) => {
	try {
		let where = {};

		const rs = await TypeSpendingsService.find({
			where: where
		}, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/TypeSpendings/:_id', utils.jsonHandler(), utils.auth('TypeSpending', 'GET'), async(req, res, next) => {
	try {
		const rs = await TypeSpendingsService.get(req.params._id, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/TypeSpendings', utils.jsonHandler(), utils.auth('TypeSpending', 'ADD'), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.icon) === true) body.icon = req.body.icon;
		if (utils.has(req.body.type) === true) body.type = +req.body.type;
		if (utils.has(req.body.parent_id) === true) body.parent_id = req.body.parent_id;

		const rs = await TypeSpendingsService.insert(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/TypeSpendings/:_id', utils.jsonHandler(), utils.auth('TypeSpending', 'UPDATE'), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.icon) === true) body.icon = req.body.icon;
		if (utils.has(req.body.type) === true) body.type = +req.body.type;
		if (utils.has(req.body.parent_id) === true) body.parent_id = req.body.parent_id;

		const rs = await TypeSpendingsService.update(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/TypeSpendings/:_id', utils.jsonHandler(), utils.auth('TypeSpending', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await TypeSpendingsService.delete(req.params._id, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})