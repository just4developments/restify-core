const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const db = require('../db');
const mailService = require('../service/mail.service');

/************************************
 ** CONTROLLER:   mailController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/7/2017, 3:31:14 PM
 *************************************/

server.get('/mail', utils.jsonHandler(), utils.auth('plugin.mail>mail', 'FIND'), async(req, res, next) => {
	try {
		let where = {};
		if(req.query.q) where = JSON.parse(req.query.q);
		where.project_id = req.auth.projectId;
		const rs = await mailService.find({
			where: where,
			sort: {
				updated_at: 1
			}
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/mail/:_id', utils.jsonHandler(), utils.auth('plugin.mail>mail', 'GET'), async(req, res, next) => {
	try {
		const rs = await mailService.get({
			_id: db.uuid(req.params._id),
			project_id: req.auth.projectId
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/attachments', utils.auth('plugin.mail>attachments', 'UPLOAD'), utils.fileUploadHandler({
	attachments: {
		uploadDir: "`assets/attachments/${req.auth.projectId.toString()}/`",
		multiples: true,
		keepName: true,
		httpPath: "`/attachments/${req.auth.projectId.toString()}/${filename}`"
	}
}), async(req, res, next) => {
	try {
		res.send(req.file.attachments);
	} catch (err) {
		next(err);
	}
})

server.post('/mail', utils.jsonHandler(), utils.auth('plugin.mail>mail', 'PUSH'), async(req, res, next) => {
	try {
		let body = {};
		body.project_id = req.auth.projectId;
		if (utils.has(req.body.title)) body.title = req.body.title;		
		if (utils.has(req.body.content)) body.content = req.body.content;
		if (utils.has(req.body.html)) body.html = utils.boolean(req.body.html);
		if (utils.has(req.body.from)) body.from = utils.object(req.body.from);
		if (utils.has(req.body.to)) body.to = utils.object(req.body.to);
		if (utils.has(req.body.cc)) body.cc = utils.object(req.body.cc);
		if (utils.has(req.body.bcc)) body.bcc = utils.object(req.body.bcc);
		if (utils.has(req.body.attachments)) body.attachments = utils.object(req.body.attachments);

		const rs = await mailService.insert(body, req.body.config_name, req.auth);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/mail/:_id', utils.jsonHandler(), utils.auth('plugin.mail>mail', 'DELETE'), async(req, res, next) => {
	try {
		const rs = await mailService.delete({
			_id: db.uuid(req.params._id),
			project_id: req.auth.projectId
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
})