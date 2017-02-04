const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const roleService = require('../service/role.service');

/************************************
 ** CONTROLLER:   roleController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/4/2017, 3:58:02 PM
 *************************************/

server.get('/role', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await roleService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/role/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await roleService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/role', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.body.project_id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.api) === true) body.api = utils.object(req.body.api);
		if (utils.has(req.body.web) === true) body.web = utils.object(req.body.web);
		if (utils.has(req.body.mob) === true) body.mob = utils.object(req.body.mob);
		if (utils.has(req.body.created_at) === true) body.created_at = utils.date(req.body.created_at);
		if (utils.has(req.body.updated_at) === true) body.updated_at = utils.date(req.body.updated_at);

		const rs = await roleService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/role/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		body.project_id = req.body.project_id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.api) === true) body.api = utils.object(req.body.api);
		if (utils.has(req.body.web) === true) body.web = utils.object(req.body.web);
		if (utils.has(req.body.mob) === true) body.mob = utils.object(req.body.mob);
		if (utils.has(req.body.created_at) === true) body.created_at = utils.date(req.body.created_at);
		if (utils.has(req.body.updated_at) === true) body.updated_at = utils.date(req.body.updated_at);

		const rs = await roleService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/role/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await roleService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})