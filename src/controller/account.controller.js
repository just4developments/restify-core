const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const accountService = require('../service/account.service');

/************************************
 ** CONTROLLER:   accountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/4/2017, 3:58:02 PM
 *************************************/

server.get('/account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await accountService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await accountService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.body.project_id;
		if (utils.has(req.body.role_ids) === true) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app) === true) body.app = req.body.app;
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.recover_by) === true) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);
		body.token = req.body.token;
		if (utils.has(req.body.created_at) === true) body.created_at = utils.date(req.body.created_at);
		if (utils.has(req.body.updated_at) === true) body.updated_at = utils.date(req.body.updated_at);

		const rs = await accountService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		body.project_id = req.body.project_id;
		if (utils.has(req.body.role_ids) === true) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app) === true) body.app = req.body.app;
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.recover_by) === true) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);
		body.token = req.body.token;
		if (utils.has(req.body.created_at) === true) body.created_at = utils.date(req.body.created_at);
		if (utils.has(req.body.updated_at) === true) body.updated_at = utils.date(req.body.updated_at);

		const rs = await accountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await accountService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})