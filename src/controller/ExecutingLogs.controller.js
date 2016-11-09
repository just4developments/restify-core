let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let ExecutingLogsService = require('../service/ExecutingLogs.service')();

/************************************
** CONTROLLER:   ExecutingLogsController
** AUTHOR:       Unknown
** CREATED DATE: 11/8/2016, 1:46:16 PM
*************************************/

server.get('/ExecutingLogs', utils.jsonHandler(), (req, res, next) => {
    return ExecutingLogsService.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/ExecutingLogs/:_id', utils.jsonHandler(), (req, res, next) => {
    return ExecutingLogsService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/ExecutingLogs/:_id', utils.jsonHandler(), (req, res, next) => {
    ExecutingLogsService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})