let restify = require('restify');

let DB = require('../db');
let utils = require('../utils');
/************************************
** SERVICE:      ExecutingLogsController
** AUTHOR:       Unknown
** CREATED DATE: 11/8/2016, 1:46:16 PM
*************************************/

module.exports = () => {
    let db = DB('ExecutingLogs');
    let self = {
        EVENT_TYPE: {
            INSTALLING: 0,
            EXECUTING: 1,
            SCRIPT: 2,
            TESTING: 3
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
                    if(!utils.has(obj.event_type)) throw new restify.BadRequestError('event_type is required!');
					if(!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');					
					if(!utils.has(obj.title)) throw new restify.BadRequestError('title is required!');
					if(!utils.has(obj.shellclass_id)) throw new restify.BadRequestError('shellclass_id is required!');
                    break;
                case 1: // For updating
                    obj.finished_time = new Date();
                    if(!utils.has(obj.status)) throw new restify.BadRequestError('status is required!');
					if(!utils.has(obj.result)) throw new restify.BadRequestError('result is required!');
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
                    reject(e);
                }
            });
        },

        update: (obj) => {
            return new Promise((resolve, reject) => {
                try {
                    self.validate(obj, 1);
                    db().open().then((db) => {
                        db.update(obj).then(resolve).catch(reject);
                    }).catch(reject);
                        
                } catch (e) {
                    reject(e);
                }
            });
        },

        delete: (_id) => {
            return db().open().then((db) => {
                db.delete(_id);  
            }).catch(reject);
        }
    };
    return self;
}