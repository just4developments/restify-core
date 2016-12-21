const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ShellInstanceService = require('../service/ShellInstance.service');

/************************************
 ** CONTROLLER:   ShellInstanceController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 3:42:44 PM
 *************************************/

// Get instance information
server.get('/ShellInstance/information/:id', utils.jsonHandler(), async(req, res, next) => {
    try {
		const rs = ShellInstanceService.getInformation(req.params.id);
		res.send(rs);
	}catch(err){
		next(err);
	} 
});

// Get instances by class id
server.get('/ShellInstances/:shellclass_id', utils.jsonHandler(), async(req, res, next) => {
	let where = {};    
	try {		
		where.shellclass_id = req.params.shellclass_id;
		if(utils.has(req.query.status) === true) where.status = +req.query.status;
		else where.status = { $ne: ShellInstanceService.STATE.DELETED };
		const rs = await ShellInstanceService.find({where});
		res.send(rs);
	} catch (err) {
		next(err);
	}
});

// Create instance
server.post('/ShellInstance/:shellclass_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		let body = {
			shellclass_id: req.params.shellclass_id
		};
		if (utils.has(req.body) === true) body.input_data = utils.object(req.body);		
		const rs = await ShellInstanceService.createInstance(body);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Deploy instance
server.post('/ShellInstance/deploy/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ShellInstanceService.deployInstance(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Undeploy instance
server.del('/ShellInstance/deploy/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ShellInstanceService.undeployInstance(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})

// Delete instance
server.del('/ShellInstance/:_id', utils.jsonHandler(), async(req, res, next) => {
	try {
		const rs = await ShellInstanceService.deleteInstance(req.params._id);
		res.send(rs);
	} catch (err) {
		next(err);
	}
})