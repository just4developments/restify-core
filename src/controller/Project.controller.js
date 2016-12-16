const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ProjectService = require('../service/Project.service');

/************************************
 ** CONTROLLER:   ProjectController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:03:22 PM
 *************************************/

server.get('/Project', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};

		const rs = await ProjectService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.get('/Project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ProjectService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

server.post('/Project', utils.fileUploadHandler({
	avatar: {
		uploadDir: "assets/avatar/",
		multiples: false,
		httpPath: "/avatar/${filename}",
		resize: global.appconfig.app.imageResize.avatar
	}
}), async(req, res, next) => {
	try {
		let body = {};
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;

		const rs = await ProjectService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Project/:_id', utils.fileUploadHandler({
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
		if (utils.has(req.body.name) === true) body.name = req.body.name;
		if (utils.has(req.body.status) === true) body.status = +req.body.status;

		const rs = await ProjectService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Project/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ProjectService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})