const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const projectService = require('../service/project.service');

/************************************
 ** CONTROLLER:   projectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/3/2017, 10:00:34 AM
 *************************************/

server.get('/project', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await projectService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await projectService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/project', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.config) === true) body.config = utils.object(req.body.config);

		const rs = await projectService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.config) === true) body.config = utils.object(req.body.config);

		const rs = await projectService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await projectService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})