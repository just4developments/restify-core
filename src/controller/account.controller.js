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

server.get('/account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {
			project_id: db.uuid(req.query.project_id)
		};
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
		const rs = await accountService.get(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/login', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};		
		body.project_id = db.uuid(req.headers.pj);
		if (utils.has(req.headers.app)) body.app = req.headers.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			const md5 = require('md5');
			body.password = md5(req.body.password);
		}

		const token = await accountService.login(body);
		res.header('token', token);
		res.end();
	} catch (err) {
		next(err);
	}
});

server.head('/authoriz', utils.jsonHandler(), utils.authHandler(), async(req, res, next) => {
	try {
		if(utils.has(req.headers.path)) req.auth.path = req.headers.path;
		if(utils.has(req.headers.actions)) {
			let actions = req.headers.actions;
			if(!(actions instanceof Array)) actions = actions.split(',');
			req.auth.actions = actions;
		}
		await accountService.authoriz(req.auth);	
		res.header('token', req.headers.token);
		res.header('path', req.headers.path);
		res.header('actions', req.headers.actions);
		res.end();
	} catch (error) {
		next(error);
	}
	
});

server.head('/ping', utils.jsonHandler(), utils.authHandler(), async(req, res, next) => {
	try {				
		await accountService.ping(req.auth);
		res.end();
	} catch (err) {
		next(err);
	}
});

server.get('/me', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		const rs = await accountService.get({
			where: {
				_id: req.auth.accountId
			},
			fields: {
				_id: 1,
				username: 1,
				recover_by: 1,
				more: 1
			}
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.put('/me', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.auth.accountId;
		if (utils.has(req.body.password)) {
			const md5 = require('md5');
			body.password = md5(req.body.password);
		}
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);

		const rs = await accountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.headers.pj)) body.project_id = db.uuid(req.headers.pj);
		if (utils.has(req.body.role_ids)) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app)) body.app = req.body.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			const md5 = require('md5');
			body.password = md5(req.body.password);
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

server.put('/account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = db.uuid(req.params._id);
		if (utils.has(req.headers.pj)) body.project_id = db.uuid(req.headers.pj);
		if (utils.has(req.body.role_ids)) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app)) body.app = req.body.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			const md5 = require('md5');
			body.password = md5(req.body.password);
		}
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);

		const rs = await accountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.del('/account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await accountService.delete(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});