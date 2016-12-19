let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let TestingService = require('../service/Testing.service');

/************************************
** CONTROLLER:   TestingController
** AUTHOR:       Unknown
** CREATED DATE: 12/19/2016, 10:40:22 AM
*************************************/

server.get('/Testing', utils.jsonHandler(), (req, res, next) => {
    return TestingService.find().then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/Testing/:_id', utils.jsonHandler(), (req, res, next) => {
    return TestingService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/Testing/execute/:_id', utils.jsonHandler(), (req, res, next) => {
    TestingService.execute(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/Testing', utils.jsonHandler(), (req, res, next) => {
    var body = {};
    if(utils.has(req.body.name)) body.name = req.body.name;
	if(utils.has(req.body.params, Object)) body.params = req.body.params;
	if(utils.has(req.body.shellinstance_id)) body.shellinstance_id = req.body.shellinstance_id;
	if(utils.has(req.body.pos)) body.pos = +req.body.pos;
    TestingService.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/Testing/:_id', utils.jsonHandler(), (req, res, next) => {
    var body = { _id: req.params._id };
    if(utils.has(req.body.params, Object)) body.params = req.body.params;
	if(utils.has(req.body.shellinstance_id)) body.shellinstance_id = req.body.shellinstance_id;
	body.created_date = new Date();
	body.updated_date = new Date();
	if(utils.has(req.body.status)) body.status = +req.body.status;
	if(utils.has(req.body.pos)) body.pos = +req.body.pos;
    TestingService.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/Testing/:_id', utils.jsonHandler(), (req, res, next) => {
    TestingService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})