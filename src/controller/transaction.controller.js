let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let transactionService = require('../service/transaction.service');
let productService = require('../service/product.service');

/************************************
** CONTROLLER:   transactionController
** AUTHOR:       Unknown
** CREATED DATE: 11/21/2016, 9:52:26 AM
*************************************/

server.get('/transaction', utils.jsonHandler(), (req, res, next) => {
    let days = +req.query.days || 0;
    let status = +req.query.status;
    let where = {};
    let minDay = new Date();
    minDay.setHours(0);
    minDay.setMinutes(0);
    minDay.setSeconds(0);
    minDay.setMilliseconds(0);
    minDay.setDate(days-1);
    where.created_date = { $gt: minDay};
    if(status) where.status = status;
    return transactionService.find({where: where, sortBy: {created_date : -1, status: -1}}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/transaction/:_id', utils.jsonHandler(), (req, res, next) => {
    return transactionService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.post('/transaction', auth, utils.jsonHandler(), (req, res, next) => {
    var body = {};
	if(req.body.product && req.body.product instanceof Object) body.product = req.body.product;
	if(req.body.quantity) body.quantity = +req.body.quantity;
	if(req.body.money) body.money = +req.body.money;
	if(req.body.status) body.status = +req.body.status;
    if(req.body.created_date) body.created_date = req.body.created_date;    
    transactionService.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.opts('/transaction/:_id', (req, res, next) => {
    res.end();
});

server.put('/transaction/:_id', auth, utils.jsonHandler(), (req, res, next) => {
    var body = { _id: req.params._id };
    if(req.body.status) body.status = +req.body.status;
    transactionService.update(body).then((rs) => {
        if(body.status === -1) {
            productService.get(req.body.product._id).then((item) => {
                var sizeIndex = item.sizes.findIndex((e) => {
                    return e.size == req.body.size.size;
                });
                item.quantity+=req.body.quantity;
                item.sizes[sizeIndex].quantity += req.body.quantity;
                productService.update(item).then((rs1) => {
                    res.send(rs1);
                }).catch(next);
            }).catch(next);
        }else{
            res.send(rs);
        }
    }).catch(next);
});

server.del('/transaction/:_id', auth, utils.jsonHandler(), (req, res, next) => {
    transactionService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})