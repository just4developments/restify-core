let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let test1Service = require('../service/test1.service')();

/************************************
** CONTROLLER:   test1Controller
** AUTHOR:       Unknown
** CREATED DATE: 11/23/2016, 3:30:33 PM
*************************************/

server.get('/test1', utils.jsonHandler(), (req, res, next) => {
    return test1Service.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/test1/:_id', utils.jsonHandler(), (req, res, next) => {
    return test1Service.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/test1', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true,
	"httpPath": "/images/${filename}",
	"resize": global.appconfig.app.imageResize.product
}), (req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
	if(req.file.images) body.images = req.file.images;
    test1Service.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/test1/:_id', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true,
	"httpPath": "/images/${filename}",
	"resize": global.appconfig.app.imageResize.product
}), (req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.name) body.name = req.body.name;
	if(req.file.images) body.images = req.file.images;
    test1Service.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/test1/:_id', utils.jsonHandler(), (req, res, next) => {
    test1Service.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})