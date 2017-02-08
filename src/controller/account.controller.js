const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const db = require('../db');
const accountService = require('../service/account.service');

/************************************
 ** CONTROLLER:   accountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:46:21 PM
 *************************************/

server.get('/account', utils.jsonHandler(), utils.auth('plugin.oauthv2>account', 'FIND'), async(req, res, next) => {
	try {
		let where = {
			project_id: req.auth.projectId
		};
		const rs = await accountService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/account/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>account', 'GET'), async(req, res, next) => {
	try {
		const rs = await accountService.get(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/account', utils.jsonHandler(), utils.auth('plugin.oauthv2>account', 'ADD'), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.auth.projectId;
		if (utils.has(req.body.role_ids)) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app)) body.app = req.body.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			body.password = utils.md5(req.body.password);
		}
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);

		const rs = await accountService.insert(body);
		if(req.query.auto_login){
			const token = await accountService.login(body);
			res.header('token', token);
		}
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.put('/account/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>account', 'UPDATE'), async(req, res, next) => {
	try {
		let body = {};
		body._id = db.uuid(req.params._id);
		if (utils.has(req.body.role_ids)) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app)) body.app = req.body.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			body.password = utils.md5(req.body.password);
		}
		if (utils.has(req.body.secret_key)) body.secret_key = req.body.secret_key;
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);

		const rs = await accountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.del('/account/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>account', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await accountService.delete(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});