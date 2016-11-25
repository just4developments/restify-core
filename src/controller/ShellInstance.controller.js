let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let ShellInstanceService = require('../service/ShellInstance.service')();
let ShellClassService = require('../service/ShellClass.service')();

/************************************
** CONTROLLER:   ShellInstanceController
** AUTHOR:       Unknown
** CREATED DATE: 11/24/2016, 4:49:06 PM
*************************************/

server.get('/ShellInstance', utils.jsonHandler(), (req, res, next) => {
    return ShellInstanceService.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/ShellInstance/:_id', utils.jsonHandler(), (req, res, next) => {
    return ShellInstanceService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/ShellInstance', utils.jsonHandler(), (req, res, next) => {
    var body =  {
        data: req.body
    }
	body.created_date = new Date();
	body.updated_date = new Date();
    ShellInstanceService.insert(body).then((rs) => {
        ShellInstanceService.install(body.data).then((rs) => {
            res.send(rs); 
        }).catch(next);
    }).catch(next);
});

// Execute parent plugin scripts
server.post('/ShellInstance/execute/:id/:name', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.executeScript(req.params.id, req.params.name).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute parent plugin
server.post('/ShellInstance/execute/:id', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.execute(req.params.id).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute testcase
server.put('/ShellInstance/execute/:id/:index', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.execute(req.params.id, +req.params.index).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute testcase scripts
server.put('/ShellInstance/execute/:id/:name/:index', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.executeScript(req.params.id, req.params.name, +req.params.index).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

server.put('/ShellInstance/:_id', utils.jsonHandler(), (req, res, next) => {
    var body = req.body;
    body._id = req.params._id;
	body.updated_date = new Date();
    ShellInstanceService.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/ShellInstance/:_id', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})