const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const db = require('../db');
const projectService = require('../service/project.service');

/************************************
 ** CONTROLLER:   projectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/7/2017, 2:39:22 PM
 *************************************/

server.get('/project', utils.jsonHandler(), utils.auth('plugin.oauthv2>project', 'FIND'), async(req, res, next) => {
	try {
		let where = {};
		where._id = req.auth.projectId;
		const rs = await projectService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/project/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>project', 'GET'), async(req, res, next) => {
	try {
		const rs = await projectService.get(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/project', utils.jsonHandler(), utils.auth('plugin.oauthv2>project', 'ADD'), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.name)) body.name = req.body.name;
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.plugins)) body.plugins = utils.object(req.body.plugins);

		const rs = await projectService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/project/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>project', 'UPDATE'), async(req, res, next) => {
	try {
		let body = {};
		body._id = db.uuid(req.params._id);
		if (utils.has(req.body.name)) body.name = req.body.name;
		if (utils.has(req.body.status)) body.status = +req.body.status;
		if (utils.has(req.body.plugins)) body.plugins = utils.object(req.body.plugins);

		const rs = await projectService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/project/:_id', utils.jsonHandler(), utils.auth('plugin.oauthv2>project', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await projectService.delete(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
})