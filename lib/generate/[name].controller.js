const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const ${tbl}Service = require('../service/${tbl}.service')('${tbl}');

/************************************
** CONTROLLER:   ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

server.get('/${tbl}', (req, res, next) => {
    return ${tbl}Service.find().then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/${tbl}/:${key}', (req, res, next) => {
    return ${tbl}Service.get(${signKey}req.params.${key}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/${tbl}', ${hasUpload}(req, res, next) => {
    ${assignIValue}
    ${tbl}Service.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/${tbl}/:${key}', ${hasUpload}(req, res, next) => {
    var body = { ${key}: ${signKey}req.body.${key} };
    ${assignUValue}
    ${tbl}Service.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/${tbl}/:${key}', (req, res, next) => {
    ${tbl}Service.delete(${signKey}req.params.${key}).then((rs) => {
        res.send(rs);
    }).catch(next);
})