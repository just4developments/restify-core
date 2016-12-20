const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ShellClassService = require('../service/ShellClass.service');

/************************************
 ** CONTROLLER:   ShellClassController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 2:48:32 PM
 *************************************/

// Search plugin
server.get('/ShellClass', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {};
		if (utils.has(req.query.status)) where.status = +req.query.status;
		const rs = await ShellClassService.find({
			where: where,
			page: +req.query.page,
            recordsPerPage: +req.query.recordsPerPage,
            sort: {
                updated_date: -1
            }
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// server.get('/ShellClass/:_id', utils.jsonHandler(), async(req, res, next) => {
// 	try {
// 		const rs = await ShellClassService.get(req.params._id);
// 		res.send(rs);
// 	} catch (err) {
// 		next(err);
// 	}
// });

// Upload plugin
server.post('/ShellClass', utils.fileUploadHandler({
	shells: {
		uploadDir: "assets/shells/",
		multiples: false,
		httpPath: "/shells/${filename}"
	}
}), async(req, res, next) => {
	try {
		const rs = await ShellClassService.uploadPlugin(req.file.shells);
		res.send(rs);
	} catch (err) {
		utils.deleteFile(utils.getAbsoluteUpload(req.file.shells, path.join(__dirname, '..', '..', 'assets', 'shells', '')));
		next(err);
	}
})

// Delete plugin
server.del('/ShellClass/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ShellClassService.deletePlugin(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})