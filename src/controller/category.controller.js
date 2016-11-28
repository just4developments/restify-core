let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let categoryService = require('../service/category.service')();

/************************************
** CONTROLLER:   categoryController
** AUTHOR:       Unknown
** CREATED DATE: 11/9/2016, 5:35:07 PM
*************************************/

server.get('/category', utils.jsonHandler(), (req, res, next) => {
    return categoryService.find({sortBy: {position: 1}}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/category/:_id', utils.jsonHandler(), (req, res, next) => {
    return categoryService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/category', utils.jsonHandler(), (req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
    categoryService.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/category/:_id', utils.jsonHandler(), (req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.name) body.name = req.body.name;
    categoryService.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/category/:_id', utils.jsonHandler(), (req, res, next) => {
    categoryService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})