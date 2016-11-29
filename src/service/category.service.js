let restify = require('restify');

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      categoryController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/9/2016, 5:35:07 PM
 *************************************/

const COLLECTION = 'category';

exports = module.exports = {

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                break;
            case 1: // For updating
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                break;
        }
        return obj;
    },

    find: (fil) => {
        return new Promise((resolve, reject) => {
            db.open(COLLECTION).then((db) => {
                db.find(fil, db.CLOSE_AFTER_DONE).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    get: (_id) => {
        return new Promise((resolve, reject) => {
            db.open(COLLECTION).then((db) => {
                db.get(_id, db.CLOSE_AFTER_DONE).then(resolve).catch(reject);;
            }).catch(reject);
        });
    },

    insert: (obj) => {
        return new Promise((resolve, reject) => {
            try {
                obj = exports.validate(obj, 0);
                db.open(COLLECTION).then((db) => {
                    db.insert(obj, db.CLOSE_AFTER_DONE).then(resolve).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },

    update: (obj) => {
        return new Promise((resolve, reject0) => {
            try {
                exports.validate(obj, 1);
                db.open(COLLECTION).then((db) => {
                    db.update(obj, db.CLOSE_AFTER_DONE).then(resolve).catch(reject);
                }).catch(reject)
            } catch (e) {
                reject(e);
            }
        });
    },

    delete: (_id) => {
        return new Promise((resolve, reject0) => {
            db.open(COLLECTION).then((db) => {
                db.delete(_id, db.CLOSE_AFTER_DONE).then(resolve).catch(reject);
            }).catch(reject)
        });
    }
}