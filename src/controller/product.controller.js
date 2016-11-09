let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let productService = require('../service/product.service')();

/************************************
** CONTROLLER:   productController
** AUTHOR:       Unknown
** CREATED DATE: 11/9/2016, 5:35:07 PM
*************************************/

server.get('/product', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    return productService.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/product/:_id', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    return productService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/product', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
	if(req.body.category_id) body.category_id = +req.body.category_id;
	if(req.body.money) body.money = +req.body.money;
	body.created_date = new Date();
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/images/');
	if(req.body.details && req.body.details instanceof Array) body.details = req.body.details;
    productService.insert(body).then((rs) => {
        res.send(rs);
    }).catch((err) => {
        utils.deleteFile(utils.getAbsoluteUpload(body.images));
        next(err);
    });
});

server.put('/product/:_id', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
	if(req.body.category_id) body.category_id = +req.body.category_id;
	if(req.body.money) body.money = +req.body.money;
	body.created_date = new Date();
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/images/');
	if(req.body.details && req.body.details instanceof Array) body.details = req.body.details;
    productService.update(body).then((rs) => {
        res.send(rs);
    }).catch((err) => {
        utils.deleteFile(utils.getAbsoluteUpload(body.images));
        next(err);
    });
});

server.del('/product/:_id', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    productService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})