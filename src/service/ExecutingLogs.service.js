let restify = require('restify');

let db = require('../db');
let utils = require('../utils');
/************************************
 ** SERVICE:      exportsController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/8/2016, 1:46:16 PM
 *************************************/

exports = module.exports = {
    COLLECTION: 'ExecutingLogs',
    EVENT_TYPE: {
        UPLOAD_PLUGIN: 0,
        DELETE_PLUGIN: 0,
        CREATE_INSTANCE: 1,
        DELETE_INSTANCE: -1,
        DEPLOY_INSTANCE: 2, // 
        UNDEPLOY_INSTANCE: -2, 
        GET_INFORMATION: 3,
        RESTART_INSTANCE: 4,
        RUN_TESTING: 5
    },
    STATUS: {
        RUNNING: 0,
        SUCCESSED: 1,
        FAILED: -1
    },

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                obj.started_time = new Date();
                if (!utils.has(obj.event_type)) throw new restify.BadRequestError('event_type is required!');
                if (!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
                if (!utils.has(obj.title)) throw new restify.BadRequestError('title is required!');
                // if (!utils.has(obj.shellclass_id)) throw new restify.BadRequestError('shellclass_id is required!');
                break;
            case 1: // For updating
                obj.finished_time = new Date();
                if (!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
                if (!utils.has(obj.result)) throw new restify.BadRequestError('result is required!');
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
        return new Promise((resolve, reject) => {
            try {
                exports.validate(obj, 1);
                db.open(exports.COLLECTION).then((db) => {
                    db.update(obj, db.FAIL).then(resolve).catch(reject);
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    delete: (_id) => {
        return db.open(exports.COLLECTION).then((db) => {
            db.delete(_id);
        }).catch(reject);
    }
}