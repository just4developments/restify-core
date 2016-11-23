let restify = require('restify');
let path = require('path');

let DB = require('../db');
let utils = require('../utils');

/************************************
** SERVICE:      test1Controller
** AUTHOR:       Unknown
** CREATED DATE: 11/23/2016, 3:30:33 PM
*************************************/

module.exports = () => {
    let db = DB('test1');
    let self = {

        validate: (obj, action) => {
            switch (action) {
                case 0: // For inserting
                    if(!utils.has(obj.images)) throw new restify.BadRequestError('images is required!');
                    break;
                case 1: // For updating
                    if(!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
					if(!utils.has(obj.images)) throw new restify.BadRequestError('images is required!');
                    break;
            }
            return obj;
        },

        find: (fil) => {
            return new Promise((resolve, reject) => {
                db().open().then((db) => {
                    db.find(fil).then(resolve).catch(reject); 
                }).catch(reject); 
            });
        },

        get: (_id) => {
            return new Promise((resolve, reject) => {
                db().open().then((db) => {
                    db.get(_id).then(resolve).catch(reject);; 
                }).catch(reject);
            });
        },

        insert: (obj) => {
            return new Promise((resolve, reject) => {
                try {
                    obj = self.validate(obj, 0);
                    db().open().then((db) => {
                        db.insert(obj).then(resolve).catch(reject);
                    }).catch(reject);
                } catch (e) {
                    utils.deleteFile(utils.getAbsoluteUpload(obj.images, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                    reject(e);
                }
            });
        },

        update: (obj) => {
            return new Promise((resolve, reject0) => {
                try {
                    self.validate(obj, 1);
                    db(undefined, true).open().then((db) => {
                        let reject = (err) => {
                            db.close();
                            reject0(err);
                        };
                        db.get(obj._id).then((item) => {
                            let oldimages = item.images;
                            db.update(obj).then((rs) => {
                                db.close();                            
                                utils.deleteFile(utils.getAbsoluteUpload(oldimages, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                                resolve(rs);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject0);
                } catch (e) {
                    utils.deleteFile(utils.getAbsoluteUpload(obj.images, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                    reject0(e);
                }
            });
        },

        delete: (_id) => {
            return new Promise((resolve, reject0) => {
                db(undefined, true).open().then((db) => {
                    let reject = (err) => {
                        db.close();
                        reject0(err);
                    };
                    db.get(_id).then((item) => {
                        let oldimages = item.images;                        
                        db.delete(_id).then((rs) => {
                            db.close();
                            utils.deleteFile(utils.getAbsoluteUpload(oldimages, path.join(__dirname, '..', '..', 'assets', 'images', '')), global.appconfig.app.imageResize.product);
                            resolve(rs);
                        }).catch(reject);                        
                    }).catch(reject);
                }).catch(reject0);
            });
        }
    };
    return self;
}