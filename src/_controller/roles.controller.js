const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const rolesService = require('../service/roles.service');

/************************************
 ** CONTROLLER:   rolesController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/3/2017, 11:34:16 AM
 *************************************/

server.get('/roles', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {
			project_id: req.query.project_id
		};

		const rs = await rolesService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/roles/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await rolesService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/roles', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.body.project_id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.api) === true) body.api = utils.object(req.body.api);
		if (utils.has(req.body.web) === true) body.web = utils.object(req.body.web);
		
		const rs = await rolesService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/roles/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		body.project_id = req.body.project_id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.api) === true) body.api = utils.object(req.body.api);
		if (utils.has(req.body.web) === true) body.web = utils.object(req.body.web);

		const rs = await rolesService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/roles/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await rolesService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})