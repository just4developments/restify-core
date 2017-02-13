const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const utils = require('../utils');
const db = require('../db');
const logService = require('../service/log.service');

/************************************
 ** CONTROLLER:   logController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/13/2017, 11:10:54 AM
 *************************************/

server.get('/log', utils.jsonHandler(), utils.auth('plugin.log>log', 'FIND'), async(req, res, next) => {
	try {
		let where = req.query.q ? JSON.parse(req.query.q) : {};
		where.project_id = req.auth.projectId;		
		const rs = await logService.find({
			where: where,
			fields: {
				project_id: 0
			}
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/log/:_id', utils.jsonHandler(), utils.auth('plugin.log>log', 'GET'), async(req, res, next) => {
	try {
		const rs = await logService.get({
			where: {
				_id: db.uuid(req.params._id),
				project_id: req.auth.projectId
			}, 
			fields: {
				project_id: 0
			}
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/log', utils.jsonHandler(), utils.auth('plugin.log>log', 'GET'), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.auth.projectId;
		body.account_id = req.auth.accountId;
		if (utils.has(req.body)) _.merge(body, utils.object(req.body));

		const rs = await logService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/log/:_id', utils.jsonHandler(), utils.auth('plugin.log>log', 'GET'), async(req, res, next) => {
	try {
		let body = {};
		body._id = db.uuid(req.params._id);		
		if (utils.has(req.body)) _.merge(body, utils.object(req.body));

		const rs = await logService.update(body, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/log/:_id', utils.jsonHandler(), utils.auth('plugin.log>log', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await logService.delete({
			_id: db.uuid(req.params._id),
			project_id: req.auth.projectId			
		}, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})