const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const db = require('../db');
const configService = require('../service/config.service');

/************************************
 ** CONTROLLER:   configController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/6/2017, 2:35:57 PM
 *************************************/

server.get('/config', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};
		const rs = await configService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/config/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await configService.get(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/config', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.project_id)) body.project_id = db.uuid(req.body.project_id);
		if (utils.has(req.body.single_mode)) body.single_mode = utils.boolean(req.body.single_mode);
		if (utils.has(req.body.session_expired)) body.session_expired = +req.body.session_expired;

		const rs = await configService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/config/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = db.uuid(req.params._id);
		if (utils.has(req.body.project_id)) body.project_id = db.uuid(req.body.project_id);
		if (utils.has(req.body.single_mode)) body.single_mode = utils.boolean(req.body.single_mode);
		if (utils.has(req.body.session_expired)) body.session_expired = +req.body.session_expired;

		const rs = await configService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/config/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await configService.delete(db.uuid(req.params._id));
		res.send(rs);
	} catch (err) {
		next(err);
	}
})