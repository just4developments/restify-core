const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const WalletService = require('../service/Wallet.service');

/************************************
 ** CONTROLLER:   WalletController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/31/2016, 12:17:46 AM
 *************************************/

server.get('/Wallet', utils.jsonHandler(), utils.auth('Wallet', 'FIND'),async(req, res, next) => {
	try {
		let where = {};

		const rs = await WalletService.find({
			where: where
		}, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/Wallet/:_id', utils.jsonHandler(), utils.auth('Wallet', 'GET'),async(req, res, next) => {
	try {
		const rs = await WalletService.get(req.params._id, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/Wallet', utils.jsonHandler(), utils.auth('Wallet', 'ADD'), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.icon) === true) body.icon = req.body.icon;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.money) === true) body.money = +req.body.money;
		if (utils.has(req.body.type) === true) body.type = +req.body.type;

		const rs = await WalletService.insert(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Wallet/:_id', utils.jsonHandler(), utils.auth('Wallet', 'UPDATE'), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.icon) === true) body.icon = req.body.icon;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.money) === true) body.money = +req.body.money;
		if (utils.has(req.body.type) === true) body.type = +req.body.type;

		const rs = await WalletService.update(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Wallet/:_id', utils.jsonHandler(), utils.auth('Wallet', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await WalletService.delete(req.params._id, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})