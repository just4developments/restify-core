let restify = require('restify');
let path = require('path');
let _ = require('lodash');

let utils = require('../utils');
let productService = require('../service/product.service');

/************************************
** CONTROLLER:   productController
** AUTHOR:       Unknown
** CREATED DATE: 11/9/2016, 5:35:07 PM
*************************************/

server.get('/product', utils.jsonHandler(), (req, res, next) => {
    let where = {};
    let sortBy = {
        position: 1
    };
    let fields = {};
    let recordsPerPage = 20;
    if(!req.headers.isnana) where.status = 1;
    if(!req.headers.isnana) {
        fields.money0 = 0;
        fields.quantity0 = 0;
    }
    if(req.query.recordsPerPage) recordsPerPage = +req.query.recordsPerPage;    
    let type = req.query.type || 'newest';
    if(req.query.categoryId) where.category_id=req.query.categoryId;
    if(type === 'hot'){
        where.special = true;
    }
    return productService.find({where: where, sortBy: sortBy, recordsPerPage: recordsPerPage, fields: fields}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/product/:_id', utils.jsonHandler(), (req, res, next) => {
    return productService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.opts('/product', (req, res, next) => {
    res.end();
});

server.post('/product', auth, utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true,
	"httpPath": "/images/${filename}",
	"resize": global.appconfig.app.imageResize.product
}), (req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
	if(req.body.size) body.size = req.body.size;
    if(req.body.category_id) body.category_id = req.body.category_id;
	if(req.body.money !== undefined) body.money = +req.body.money;
    if(req.body.money0 !== undefined) body.money0 = +req.body.money0;
    if(req.body.special !== undefined) body.special = JSON.parse(req.body.special);
	body.des = req.body.des;
    body.created_date = new Date(JSON.parse(req.body.created_date));
    body.updated_date = new Date();
    body.status = +req.body.status || 0;
    body.position = +req.body.position || 1;
    body.quantity = 0;
    body.quantity0 = 0;
    body.tags = JSON.parse(req.body.tags);
	if(req.file.images) body.images = req.file.images;
	if(req.body.sizes) {
        body.sizes = JSON.parse(req.body.sizes);
        for(var i in body.sizes){
            body.quantity += body.sizes[i].quantity;
            body.quantity0 += body.sizes[i].quantity0;
        }
    }    

    productService.insert(body).then((rs) => {
        res.send(rs.ops[0]);
    }).catch(next);
});

server.opts('/product/sell', (req, res, next) => {
    res.end();
});

server.post('/product/sell', auth, utils.jsonHandler(), (req, res, next) => {
    let pro = _.cloneDeep(req.body.product);
    delete pro.images;
    productService.update(pro).then((rs0) => {
        let transactionService = require('../service/transaction.service');
        transactionService.insert(req.body).then((rs) => {
            res.send(rs);
        }).catch(next);
    }).catch(next);
});

server.put('/product/:id', auth, utils.jsonHandler(), (req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.status !== undefined) body.status = +req.body.status;
	if(req.body.special !== undefined) body.special = req.body.special;
    if(req.body.position !== undefined) body.position = +req.body.position;
	body.updated_date = new Date();
	productService.update(body).then((rs) => {
        res.send(body);
    }).catch(next);
});

server.put('/product', auth, utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true,
	"httpPath": "/images/${filename}",
	"resize": global.appconfig.app.imageResize.product
}), (req, res, next) => {
    var body = { _id: req.body._id };
    if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
    if(req.body.status !== undefined) body.status = +req.body.status;
    if(req.body.position !== undefined) body.position = +req.body.position;
    body.quantity = 0;
    body.quantity0 = 0;
	if(req.body.category_id) body.category_id = req.body.category_id;
    if(req.body.special !== undefined) body.special = JSON.parse(req.body.special);
	if(req.body.money !== undefined) body.money = +req.body.money;
    if(req.body.money0 !== undefined) body.money0 = +req.body.money0;
    body.des = req.body.des;
    body.tags = JSON.parse(req.body.tags);
    body.created_date = new Date(JSON.parse(req.body.created_date));
	body.updated_date = new Date();
	if(req.file && req.file.images) body.images = req.file.images;
    // else if(req.body.images) body.images = JSON.parse(req.body.images);
	if(req.body.sizes) {
        body.sizes = JSON.parse(req.body.sizes);
        for(var i in body.sizes){ 
            body.quantity0 += body.sizes[i].quantity0;
            body.quantity += body.sizes[i].quantity;
        }
    }    
    productService.update(body).then((rs) => {
        res.send(body);
    }).catch(next);
});

server.del('/product/:_id', auth, utils.jsonHandler(), (req, res, next) => {
    productService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})