const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const db = require('../db');

/************************************
 ** CONTROLLER:   clientController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:46:21 PM
 *************************************/

server.post('/login', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};		
		body.project_id = db.uuid(req.headers.pj);
		if (utils.has(req.headers.app)) body.app = req.headers.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			body.password = utils.md5(req.body.password);
		}
		const accountService = require('../service/account.service');
		const token = await accountService.login(body);
		res.header('token', token);
		res.end();
	} catch (err) {
		next(err);
	}
});

server.head('/authoriz', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		if(utils.has(req.headers.path)) req.auth.path = req.headers.path;
		if(utils.has(req.headers.actions)) req.auth.actions = req.headers.actions.split(',');
		const accountService = require('../service/account.service');
		await accountService.authoriz(req.auth);
		res.header('token', `${req.auth.projectId.toString()}-${req.auth.accountId.toString()}-${req.auth.secretToken.toString()}`);
		res.end();
	} catch (error) {
		next(error);
	}
	
});

server.head('/ping', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {				
		const accountService = require('../service/account.service');
		await accountService.ping(req.auth);
		res.end();
	} catch (err) {
		next(err);
	}
});

server.post('/upload-image', utils.authHandler(true), utils.fileUploadHandler({
	file: {
		uploadDir: "`assets/upload/${req.auth.projectId}/`",
		multiples: false,
		keepName: false,
		httpPath: "`/upload/${req.auth.projectId}/${filename}`"
	}
}), async(req, res, next) => {
	try {
		res.send(req.file.file);
	} catch (err) {
		next(err);
	}
})

server.get('/project-config', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		const projectService = require('../service/project.service');
		const rs = await projectService.getConfig(req.auth.projectId, req.query.plugin);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.put('/project', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.auth.projectId;
		if (utils.has(req.body.name)) body.name = req.body.name;
		if (utils.has(req.body.plugins)) body.plugins = utils.object(req.body.plugins);
		const projectService = require('../service/project.service');
		const rs = await projectService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.get('/me', utils.jsonHandler(), utils.authHandler(true), async(req, res, next) => {
	try {
		const accountService = require('../service/account.service');
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
			body.password = utils.md5(req.body.password);
		}
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);
		const accountService = require('../service/account.service');
		const rs = await accountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/register', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.headers.pj)) body.project_id = db.uuid(req.headers.pj);
		if (utils.has(req.body.role_ids)) body.role_ids = utils.object(req.body.role_ids);
		if (utils.has(req.body.app)) body.app = req.body.app;
		if (utils.has(req.body.username)) body.username = req.body.username;
		if (utils.has(req.body.password)) {
			body.password = utils.md5(req.body.password);
		}
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.recover_by)) body.recover_by = req.body.recover_by;
		if (utils.has(req.body.more)) body.more = utils.object(req.body.more);
		const accountService = require('../service/account.service');
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