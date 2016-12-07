let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let ShellInstanceService = require('../service/ShellInstance.service');
let ShellClassService = require('../service/ShellClass.service');

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

server.get('/ShellInstanceByClass/:_id', utils.jsonHandler(), (req, res, next) => {
    return ShellInstanceService.find({where: {"shellclass_id": req.params._id} }).then((rs) => {
        res.send(rs);
    }).catch(next);
});

// Create instance
server.post('/ShellInstance', utils.jsonHandler(), (req, res, next) => {
    var body =  req.body;
    body.status = {
        installing: 0,
        executing: 0
    };
	body.created_date = new Date();
	body.updated_date = new Date();
    ShellInstanceService.insert(body).then((rs0) => {
        ShellInstanceService.createInstance(rs0.ops[0]).then((rs) => {
            res.send({instance: rs0.ops[0], session: rs["#"]}); 
        }).catch(next);
    }).catch(next);
});

// Delete instance
server.del('/ShellInstance/:id', utils.jsonHandler(), (req, res, next) => {
    var body =  req.body;
    body.status = {
        installing: 0,
        executing: 0
    };
	body.updated_date = new Date();
    res.send('09324923402802390');
});

// Deploy instance
server.post('/ShellInstance/deploy/:id', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.deployInstance(req.params.id).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Delete Deploy instance
server.del('/ShellInstance/deploy/:id', utils.jsonHandler(), (req, res, next) => {
    res.send('09324923402802390');
});

// Execute parent plugin scripts GetInformation
server.get('/ShellInstance/information/:id', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.getInformation(req.params.id).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute parent plugin scripts like restart ...
server.post('/ShellInstance/execute-script/:id/:name', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.executeScript(req.params.id, req.params.name).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute testcase Execute Test
server.put('/ShellInstance/execute/:id/:index', utils.jsonHandler(), (req, res, next) => {
    ShellInstanceService.execute(req.params.id, +req.params.index).then((rs) => {
       res.send(rs["#"]); 
    }).catch(next);
});

// Execute testcase scripts Execute get information test
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