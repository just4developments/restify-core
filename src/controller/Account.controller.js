const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const AccountService = require('../service/Account.service');

/************************************
 ** CONTROLLER:   AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

// server.get('/Account', utils.jsonHandler(), async(req, res, next) => {
// 	try {
// 		let where = {};

// 		const rs = await AccountService.find({
// 			where: where
// 		});
// 		res.send(rs);
// 	} catch (err) {
// 		next(err);
// 	}
// });

// Get account details
// server.get('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
// 	try {
// 		const rs = await AccountService.get(req.params._id);
// 		res.send(rs);
// 	} catch (err) {
// 		next(err);
// 	}
// });

// My information
server.get('/Me', utils.jsonHandler(), utils.auth, async(req, res, next) => {
	try {		
		const rs = await AccountService.getMe(req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Check author
server.head('/Authoriz', utils.jsonHandler(), utils.auth, async(req, res, next) => {
	try {
		const rs = await AccountService.authoriz(req.auth, req.headers.path, req.headers.actions.split(','));
		res.header('actions', rs.join(','));
		res.end();
	} catch (err) {
		next(err);
	}
});

// Get author
server.get('/Authoriz', utils.jsonHandler(), utils.auth, async(req, res, next) => {
	try {
		const rs = await AccountService.getAuthoriz(req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Check login
server.head('/Login', utils.jsonHandler(), async(req, res, next) => {
	try {
		const token = await AccountService.login(req.headers.pj, req.headers.username, req.headers.password, req.headers.app);
		res.header('token', token);
		res.end();
	} catch (err) {
		next(err);
	}
});

// Login and auto create new account when user not existed
server.post('/Login', utils.jsonHandler(), async(req, res, next) => {
	try {
		try {
			const token = await AccountService.login(req.headers.pj, req.body.username, req.body.password, req.headers.app);
			res.header('token', token);
			res.end();
		}catch(e){
			if(e && e.body && e.body.message !== 'NOT_EXISTED') throw e;
			let body = {};
			if (utils.has(req.body.username) === true) body.username = req.body.username;
			if (utils.has(req.body.password) === true) body.password = req.body.password;
			if (utils.has(req.headers.app) === true) body.app = req.headers.app;
			if (utils.has(req.body.status) === true) body.status = +req.body.status;
			if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);
			if (utils.has(req.body.roles) === true) body.roles = utils.object(req.body.roles);

			const rs = await AccountService.insert(body, req.headers.pj);
			const token = await AccountService.login(req.headers.pj, req.body.username, req.body.password, req.headers.app);
			res.header('token', token);
			res.header('isnew', true);
			res.end();
		}		
	} catch (err) {
		next(err);
	}
});

// Create new account
server.post('/Account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);
		if (utils.has(req.body.roles) === true) body.roles = utils.object(req.body.roles);

		const rs = await AccountService.insert(body, req.headers.pj);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Update role for account
server.put('/Account/:accountId/Role', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;
		const rs = await AccountService.updateRole(req.headers.pj, req.params.accountId, req.body.roles);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.more) === true) body.more = utils.object(req.body.more);

		const rs = await AccountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.delete(req.headers.pj, req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})