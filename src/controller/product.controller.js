const restify = require('restify');
const path = require('path');

const utils = require('../utils');
const productService = require('../service/product.service')('product');

/************************************
** CONTROLLER:   productController
** AUTHOR:       Unknown
** CREATED DATE: 11/5/2016, 9:17:02 PM
*************************************/

server.get('/product', (req, res, next) => {
    return productService.find({}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/product/:_id', (req, res, next) => {
    return productService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/product', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}),(req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
	if(req.body.category_id) body.category_id = +req.body.category_id;
	if(req.body.createdDate) body.createdDate = req.body.createdDate;
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/assets/images/');
	if(req.body.details && req.body.details instanceof Array) body.details = req.body.details;
    productService.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.put('/product/:_id', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}),(req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
	if(req.body.category_id) body.category_id = +req.body.category_id;
	if(req.body.createdDate) body.createdDate = req.body.createdDate;
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/assets/images/');
	if(req.body.details && req.body.details instanceof Array) body.details = req.body.details;
    productService.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.del('/product/:_id', (req, res, next) => {
    productService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})