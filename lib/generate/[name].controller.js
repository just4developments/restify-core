let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let ${tbl}Service = require('../service/${tbl}.service')();

/************************************
** CONTROLLER:   ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

server.get('/${tbl}', ${jsonBodyParser}(req, res, next) => {
    return ${tbl}Service.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/${tbl}/:${key}', ${jsonBodyParser}(req, res, next) => {
    return ${tbl}Service.get(${signKey}req.params.${key}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/${tbl}', ${jsonBodyParser}(req, res, next) => {
    ${assignIValue}
    ${tbl}Service.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/${tbl}/:${key}', ${jsonBodyParser}(req, res, next) => {
    var body = { ${key}: ${signKey}req.params.${key} };
    ${assignUValue}
    ${tbl}Service.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/${tbl}/:${key}', ${jsonBodyParser}(req, res, next) => {
    ${tbl}Service.delete(${signKey}req.params.${key}).then((rs) => {
        res.send(rs);
    }).catch(next);
})