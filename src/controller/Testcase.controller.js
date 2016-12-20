const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const TestcaseService = require('../service/Testcase.service');

/************************************
 ** CONTROLLER:   TestcaseController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 5:19:44 PM
 *************************************/

// Get testcases by instance
server.get('/Testcase/:shellinstance_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let where = {
			shellinstance_id: req.params.shellinstance_id
		};

		const rs = await TestcaseService.find({
			where: where
		});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Get testcase details information
server.get('/Testcase/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await TestcaseService.get(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Create testcase
server.post('/Testcase/:shellinstance_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {
			shellinstance_id: req.params.shellinstance_id
		};
		if (utils.has(req.body.params) === true) body.params = utils.object(req.body.params);

		const rs = await TestcaseService.insert(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Run testcase
server.post('/Testcase/run/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await TestcaseService.run(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.put('/Testcase/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {};
		body._id = req.params._id;
		if (utils.has(req.body.params) === true) body.params = utils.object(req.body.params);

		const rs = await TestcaseService.update(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

server.del('/Testcase/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await TestcaseService.delete(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})