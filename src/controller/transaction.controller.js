let restify = require('restify');
let path = require('path');
let _ = require('lodash');
let async = require('async');

let utils = require('../utils');
let transactionService = require('../service/transaction.service');

/************************************
** CONTROLLER:   transactionController
** AUTHOR:       Unknown
** CREATED DATE: 11/21/2016, 9:52:26 AM
*************************************/

server.get('/transaction', utils.jsonHandler(), (req, res, next) => {
    let where = {};
    let from = new Date(+req.query.from);
    from.setHours(0);
    from.setMinutes(0);
    from.setSeconds(0);
    from.setMilliseconds(0);
    let to = new Date(+req.query.to);
    to.setHours(0);
    to.setMinutes(0);
    to.setSeconds(0);
    to.setMilliseconds(0);
    let aggregate;
    if(req.headers.isnana && req.query.chartByDate){
        aggregate = [
            { $match: { created_date: { '$gte': from, '$lte': to }, status: {$gt: -1} } },
            { $group: {_id: { month: { $month: "$created_date" }, day: { $dayOfMonth: "$created_date" }, year: { $year: "$created_date" }}, y: {$sum: "$money"} } }, 
            { $sort: {"_id.year": 1, "_id.month": 1, "_id.day": 1} } ];
            return transactionService.find({aggregate: aggregate}).then((rs) => {
                res.send(rs);
            }).catch(next); 
    }else if(req.headers.isnana && req.query.chartByMonth){
        aggregate = [
            { $match: { created_date: { '$gte': from, '$lte': to }, status: {$gt: -1} } },
            { $group: {_id: { month: { $month: "$created_date" }, year: { $year: "$created_date" }}, y: {$sum: "$money"} } }, 
            { $sort: {"_id.year": 1, "_id.month": 1} } ];
        return transactionService.find({aggregate: aggregate}).then((rs) => {
            res.send(rs);
        }).catch(next); 
    }else if(req.headers.isnana && req.query.chartByYear){
        aggregate = [
        { $match: { created_date: { '$gte': from, '$lte': to }, status: {$gt: -1} } },
        { $group: {_id: { year: { $year: "$created_date" }}, y: {$sum: "$money"} } }, 
        { $sort: {"_id.year": 1 } } ];
        return transactionService.find({aggregate: aggregate}).then((rs) => {
            res.send(rs);
        }).catch(next); 
    }else if(req.headers.isnana && req.query.chartByDayOfWeek){
        aggregate = [
        { $match: { created_date: { '$gte': from, '$lte': to }, status: {$gt: -1} } },
        { $group: {_id: { dayOfWeek: { $dayOfWeek: "$created_date" }}, y: {$sum: "$money"} } }, 
        { $sort: {"_id.dayOfWeek": 1} } ];
        return transactionService.find({aggregate: aggregate}).then((rs) => {
            res.send(rs);
        }).catch(next); 
    }else if(req.headers.isnana && req.query.chartByType){
        aggregate = [
        { $match: { type: 2 } },
        { $group: {_id: { name: "$name"}, y: {$sum: "$sold_count"} } }, 
        { $sort: {"_id.name": 1} } ];
        let categoryService = require('../service/category.service');
        return categoryService.find({aggregate: aggregate}).then((rs) => {
            res.send(rs);
        }).catch(next); 
    }else if(req.headers.isnana){
        let status = +req.query.status;
        where.created_date = { $gte: from, $lte: to};
        if(status) where.status = status;
        return transactionService.find({where: where, sort: {created_date : -1, status: -1}}).then((rs) => {
            res.send(rs);
        }).catch(next);
    }else{
        res.send(404);
    }
});

server.get('/transaction/buyer', utils.jsonHandler(), (req, res, next) => {
    let name = req.query.name;
    if(!name) return res.send([]);
    let where = {};
    if(name.indexOf("0") === 0){
        where = {
            $or: [
                {buyer: new RegExp(name, 'i')},
                {phone: new RegExp(name, 'i')}
            ]
        }
    }else{
        where = {
            $or: [
                {buyer: new RegExp(name, 'i')}
            ]
        }
    }
    return transactionService.find({
        where: where,
        fields: {
            buyer: 1,
            phone: 1,
            address: 1
        }
    }).then((rs) => {
        let ls = {};
        res.send(rs.filter((e) => {
            if(!ls[e.buyer]) {
                ls[e.buyer] = true;
                return true;
            }
            return false;
        }));
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
            let productService = require('../service/product.service');
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
            if(!req.body.product.tags) return res.send(rs);
            let categoryService = require('../service/category.service');
            let fc = [];
            for(var i in req.body.product.tags){
                fc.push(((tag, num, cb) => {                    
                    categoryService.sold(tag._id, num).then(() => {
                        cb();
                    }).catch(cb);
                }).bind(null, req.body.product.tags[i], +req.body.quantity));
            }
            async.series(fc, (err, rs0) => {
               if(err) return next(err); 
               res.send(rs);
            });
        }
    }).catch(next);
});

server.del('/transaction/:_id', auth, utils.jsonHandler(), (req, res, next) => {
    transactionService.delete(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
})