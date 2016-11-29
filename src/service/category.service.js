let restify = require('restify');

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      categoryController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/9/2016, 5:35:07 PM
 *************************************/

const COLLECTION = 'category';

module.exports = {

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
                db.find(fil, true).then(resolve).catch(reject);
            }).catch(reject);
        });
    },

    get: (_id) => {
        return new Promise((resolve, reject) => {
            db.open(COLLECTION).then((db) => {
                db.get(_id, true).then(resolve).catch(reject);;
            }).catch(reject);
        });
    },

    insert: (obj) => {
        return new Promise((resolve, reject) => {
            try {
                obj = self.validate(obj, 0);
                db.open(COLLECTION).then((db) => {
                    db.insert(obj, true).then(resolve).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },

    update: (obj) => {
        return new Promise((resolve, reject0) => {
            try {
                self.validate(obj, 1);
                db.open(COLLECTION).then((db) => {
                    db.update(obj, true).then(resolve).catch(reject);
                }).catch(reject)
            } catch (e) {
                reject(e);
            }
        });
    },

    delete: (_id) => {
        return new Promise((resolve, reject0) => {
            db.open(COLLECTION).then((db) => {
                db.delete(_id, true).then(resolve).catch(reject);
            }).catch(reject)
        });
    }
}