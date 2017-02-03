const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const accountsService = require('../service/accounts.service');

/************************************
 ** CONTROLLER:   accountsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/3/2017, 10:00:34 AM
 *************************************/

server.post('/login', utils.jsonHandler(), async(req, res, next) => {
	try {		
		if(!req.headers.token) {
			let body = {
				username: req.body.username,
				password: req.body.password,
				project_id: req.headers.pj,
				app: req.headers.app
			};
			const token = await accountsService.login(body);
			res.header('token', token.toString());
			res.end();
		}else {
			const token = await accountsService.ping(req.headers.token);
			res.header('token', token.toString());
			res.end();
		}		
	} catch (err) {
		next(err);
	}
});

server.head('/authoriz', utils.jsonHandler(), utils.authHandler(), async(req, res, next) => {
	try {
		await accountsService.authoriz(req.auth, req.headers.path, req.headers.actions);	
		res.end();
	} catch (error) {
		next(error);
	}
	
});

server.get('/me', utils.jsonHandler(), utils.authHandler(), async(req, res, next) => {
	try {
		const rs = await accountsService.get({
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

server.put('/me', utils.jsonHandler(), utils.authHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.auth.accountId;
		if (utils.has(req.body.recover_by) === true) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);

		const rs = await accountsService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/accounts', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {
			project_id: req.query.project_id
		};

		const rs = await accountsService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/accounts/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await accountsService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/accounts', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.headers.pj;
		if (utils.has(req.headers.app) === true) body.app = req.headers.app;
		if (utils.has(req.body.role_ids) === true) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.recover_by) === true) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);

		body = await accountsService.insert(body);
		if(req.query.auto_login) {
			const token = await accountsService.login(body);
			res.header('token', token.toString());
		}
		res.send(body);
	} catch (err) {
		next(err);
	}
})

server.put('/accounts/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.role_ids) === true) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.recover_by) === true) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);

		const rs = await accountsService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/accounts/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await accountsService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})