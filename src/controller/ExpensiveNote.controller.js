const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ExpensiveNoteService = require('../service/ExpensiveNote.service');

/************************************
 ** CONTROLLER:   ExpensiveNoteController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:32:25 PM
 *************************************/

server.get('/ExpensiveNote', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await ExpensiveNoteService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/ExpensiveNote/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ExpensiveNoteService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/ExpensiveNote', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.user_id) === true) body.user_id = req.body.user_id;
		if (utils.has(req.body.wallets) === true) body.wallets = utils.object(req.body.wallets);
		if (utils.has(req.body.type_spendings) === true) body.type_spendings = utils.object(req.body.type_spendings);
		if (utils.has(req.body.spendings) === true) body.spendings = utils.object(req.body.spendings);

		const rs = await ExpensiveNoteService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/ExpensiveNote/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.user_id) === true) body.user_id = req.body.user_id;
		if (utils.has(req.body.wallets) === true) body.wallets = utils.object(req.body.wallets);
		if (utils.has(req.body.type_spendings) === true) body.type_spendings = utils.object(req.body.type_spendings);
		if (utils.has(req.body.spendings) === true) body.spendings = utils.object(req.body.spendings);

		const rs = await ExpensiveNoteService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/ExpensiveNote/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ExpensiveNoteService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})