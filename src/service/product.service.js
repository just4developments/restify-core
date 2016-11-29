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

module.exports = {

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                if (!utils.has(obj.category_id)) throw new restify.BadRequestError('category_id is required!');
                if (!utils.has(obj.money)) throw new restify.BadRequestError('money is required!');
                if (!utils.has(obj.money0)) throw new restify.BadRequestError('input money is required!');
                if (!utils.has(obj.images)) throw new restify.BadRequestError('images is required!');
                break;
            case 1: // For updating
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
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
                utils.deleteFile(utils.getAbsoluteUpload(obj.images, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                reject(e);
            }
        });
    },

    update: (obj) => {
        return new Promise((resolve, reject) => {
            try {
                self.validate(obj, obj.images ? 1 : 2);
                if (obj.quantity === 0) obj.status = 0;
                db.open(COLLECTION).then((db) => {
                    db.get(obj._id, false).then((item) => {
                        let oldimages = obj.images ? item.images : undefined;
                        db.update(obj, true).then((rs) => {
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
                db.get(_id, false).then((item) => {
                    let oldimages = item.images;
                    db.delete(_id, true).then((rs) => {
                        utils.deleteFile(utils.getAbsoluteUpload(oldimages, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                        resolve(rs);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }
}