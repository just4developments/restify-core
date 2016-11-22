let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let productService = require('../service/product.service')();
let transactionService = require('../service/transaction.service')();

/************************************
** CONTROLLER:   productController
** AUTHOR:       Unknown
** CREATED DATE: 11/9/2016, 5:35:07 PM
*************************************/

server.get('/product', utils.jsonHandler(), (req, res, next) => {
    let where = {
        quantity: {
            $gt: 0
        }
    };
    let sortBy = {

    };
    let type = req.query.type || 'newest';
    if(req.query.categoryId) where.category_id=req.query.categoryId;
    if(type === 'hot'){
        where.special = true;
    }
    return productService.find({where: where, sortBy: sortBy}).then((rs) => {
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

server.post('/product', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    var body = {};
	if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
    if(req.body.size) body.size = req.body.size;
	if(req.body.category_id) body.category_id = req.body.category_id;
	if(req.body.money) body.money = +req.body.money;
    if(req.body.special) body.special = JSON.parse(req.body.special);
	body.created_date = new Date();
    body.updated_date = new Date();
    body.quantity = 0;
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/images/', true);
	if(req.body.sizes) {
        body.sizes = JSON.parse(req.body.sizes);
        for(var i in body.sizes){
            body.sizes[i].quantity0 = body.sizes[i].quantity; 
            body.quantity += body.sizes[i].quantity;
        }
    }    

    productService.insert(body).then((rs) => {
        res.send(rs.ops[0]);
    }).catch((err) => {
        utils.deleteFile(utils.getAbsoluteUpload(body.images));
        next(err);
    });
});

server.opts('/product/sell', (req, res, next) => {
    res.end();
});

server.post('/product/sell', utils.jsonHandler(), (req, res, next) => {
    productService.update(req.body.product).then((rs0) => {
        transactionService.insert(req.body).then((rs) => {
            res.send(rs);
        }).catch(next);
    }).catch(next);
});

server.put('/product', utils.fileUploadHandler({
	"uploadDir": "assets/images/",
	"multiples": true
}), (req, res, next) => {
    var body = { _id: req.body._id };
    if(req.body.name) body.name = req.body.name;
	if(req.body.des) body.des = req.body.des;
    if(req.body.size) body.size = req.body.size;
	if(req.body.category_id) body.category_id = req.body.category_id;
    if(req.body.special) body.special = JSON.parse(req.body.special);
	if(req.body.money) body.money = +req.body.money;
	body.updated_date = new Date();
	if(req.files.images) body.images = utils.getPathUpload(req.files.images, '/images/', true);
    // else if(req.body.images) body.images = JSON.parse(req.body.images);
	if(req.body.sizes) {
        body.quantity = 0;
        body.sizes = JSON.parse(req.body.sizes);
        for(var i in body.sizes){ 
            body.quantity += body.sizes[i].quantity;
        }
    }    
    productService.update(body).then((rs) => {
        res.send(body);
    }).catch((err) => {
        utils.deleteFile(utils.getAbsoluteUpload(body.images));
        next(err);
    });
});

server.del('/product/:_id', utils.jsonHandler(), (req, res, next) => {
    productService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})