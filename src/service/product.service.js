let restify = require('restify');
let path = require('path');

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      productController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/9/2016, 5:35:07 PM
 *************************************/

const COLLECTION = 'product';

exports = module.exports = {

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                if (!utils.has(obj.category_id)) throw new restify.BadRequestError('category_id is required!');
                if (!utils.has(obj.money)) throw new restify.BadRequestError('money is required!');
                if (!utils.has(obj.quantity)) throw new restify.BadRequestError('quantity is required!');
                if (!utils.has(obj.money0)) throw new restify.BadRequestError('input money is required!');
                if (!utils.has(obj.images)) throw new restify.BadRequestError('images is required!');
                break;
            case 1: // For updating
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                if (!utils.has(obj.quantity)) throw new restify.BadRequestError('quantity is required!');
                if (!utils.has(obj.category_id)) throw new restify.BadRequestError('category_id is required!');
                if (!utils.has(obj.money)) throw new restify.BadRequestError('money is required!');
                if (!utils.has(obj.money0)) throw new restify.BadRequestError('input money is required!');
                break;
            case 2: // For update without images ...
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                // if(!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
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
                utils.deleteFile(utils.getAbsoluteUpload(obj.images, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                reject(e);
            }
        });
    },

    update: (obj) => {
        return new Promise((resolve, reject) => {
            try {
                exports.validate(obj, obj.images ? 1 : 2);
                if (obj.quantity === 0) obj.status = 0;
                db.open(COLLECTION).then((db) => {
                    db.get(obj._id, db.CLOSE_AFTER_ERROR).then((item) => {
                        let oldimages = obj.images ? item.images : undefined;
                        db.update(obj, db.CLOSE_AFTER_DONE).then((rs) => {
                            utils.deleteFile(utils.getAbsoluteUpload(oldimages, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                            resolve(rs);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            } catch (e) {
                utils.deleteFile(utils.getAbsoluteUpload(obj.images, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                reject(e);
            }
        });
    },

    delete: (_id) => {
        return new Promise((resolve, reject) => {
            db.open(COLLECTION).then((db) => {
                db.get(_id, db.CLOSE_AFTER_ERROR).then((item) => {
                    let oldimages = item.images;
                    db.delete(_id, db.CLOSE_AFTER_DONE).then((rs) => {
                        utils.deleteFile(utils.getAbsoluteUpload(oldimages, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                        resolve(rs);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }
}