const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const AccountService = require('../service/Account.service');

/************************************
 ** CONTROLLER:   AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

server.get('/Account', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await AccountService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/Account', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.login(req.body.username, req.body.password);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/Account/:projectId', utils.fileUploadHandler({
	avatar: {
		uploadDir: "assets/avatar/",
		multiples: false,
		httpPath: "/avatar/${filename}",
		resize: global.appconfig.app.imageResize.avatar
	}
}), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.username) === true) body.username = req.body.username;
		if (utils.has(req.body.password) === true) body.password = req.body.password;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.email) === true) body.email = req.body.email;
		if (utils.has(req.body.birth_day) === true) body.birth_day = utils.date(req.body.birth_day);
		if (utils.has(req.file.avatar) === true) body.avatar = req.file.avatar;

		const rs = await AccountService.insert(body, req.params.projectId);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.put('/Account/:projectId/:accountId/Role', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.roles) === true) body.roles = req.body.roles;

		const rs = await AccountService.updateRole(req.params.projectId, req.params.accountId, req.body.roles);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Account/:_id', utils.fileUploadHandler({
	avatar: {
		uploadDir: "assets/avatar/",
		multiples: false,
		httpPath: "/avatar/${filename}",
		resize: global.appconfig.app.imageResize.avatar
	}
}), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.email) === true) body.email = req.body.email;
		if (utils.has(req.body.birth_day) === true) body.birth_day = utils.date(req.body.birth_day);
		if (utils.has(req.file.avatar) === true) body.avatar = req.file.avatar;

		const rs = await AccountService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Account/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await AccountService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})