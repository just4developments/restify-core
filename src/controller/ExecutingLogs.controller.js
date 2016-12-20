const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ExecutingLogsService = require('../service/ExecutingLogs.service');

/************************************
 ** CONTROLLER:   ExecutingLogsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 2:42:21 PM
 *************************************/

server.get('/ExecutingLogs', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await ExecutingLogsService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/ExecutingLogs/:shellclass_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ExecutingLogsService.get(req.params.shellclass_id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/ExecutingLogs', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.event_type) === true) body.event_type = req.body.event_type;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.title) === true) body.title = req.body.title;
		if (utils.has(req.body.started_time) === true) body.started_time = utils.date(req.body.started_time);

		const rs = await ExecutingLogsService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/ExecutingLogs/:shellclass_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body.shellclass_id = req.params.shellclass_id;
		if (utils.has(req.body.event_type) === true) body.event_type = req.body.event_type;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;
		if (utils.has(req.body.title) === true) body.title = req.body.title;
		if (utils.has(req.body.started_time) === true) body.started_time = utils.date(req.body.started_time);

		const rs = await ExecutingLogsService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/ExecutingLogs/:shellclass_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ExecutingLogsService.delete(req.params.shellclass_id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})