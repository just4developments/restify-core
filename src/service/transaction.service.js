let restify = require('restify');

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      transactionController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/21/2016, 9:52:26 AM
 *************************************/

exports = module.exports = {
    COLLECTION: 'transaction',

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                if (!utils.has(obj.product)) throw new restify.BadRequestError('product is required!');
                if (!utils.has(obj.quantity)) throw new restify.BadRequestError('quantity is required!');
                if (!utils.has(obj.money)) throw new restify.BadRequestError('money is required!');
                if (!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
                break;
            case 1: // For updating
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                if (!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
                break;
        }
        return obj;
    },

    find: (fil) => {
        return new Promise((resolve, reject) => {
            db.open(exports.COLLECTION).then((db) => {
                db.find(fil).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    get: (_id) => {
        return new Promise((resolve, reject) => {
            db.open(exports.COLLECTION).then((db) => {
                db.get(_id).then(resolve).catch(reject);;
            }).catch(reject);
        });
    },

    insert: (obj) => {
        if (!obj.created_date) obj.created_date = new Date();
        else obj.created_date = new Date(obj.created_date);
        obj.created_date.setHours(0);
        obj.created_date.setMinutes(0);
        obj.created_date.setSeconds(0);
        obj.created_date.setMilliseconds(0);
        return new Promise((resolve, reject) => {
            try {
                obj = exports.validate(obj, 0);
                db.open(exports.COLLECTION).then((db) => {
                    db.insert(obj).then(resolve).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },

    update: (obj) => {
        obj.updated_date = new Date();
        return new Promise((resolve, reject) => {
            try {
                exports.validate(obj, 1);
                db.open(exports.COLLECTION).then((db) => {
                    db.update(obj).then(resolve).catch(reject);
                }).catch(reject)
            } catch (e) {
                reject(e);
            }
        });
    },

    delete: (_id) => {
        return new Promise((resolve, reject0) => {
            db.open(exports.COLLECTION).then((db) => {
                db.delete(_id).then(resolve).catch(reject0);
            }).catch(reject0)
        });
    }
}