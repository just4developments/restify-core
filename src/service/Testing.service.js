let restify = require('restify');
let path = require('path');

let db = require('../db');
let utils = require('../utils');

/************************************
** SERVICE:      TestingController
** AUTHOR:       Unknown
** CREATED DATE: 12/19/2016, 10:40:22 AM
*************************************/

exports = module.exports = {
    COLLECTION: "Testing",
    STATE: {
        CREATED: 1,
        TESTING: 2,
        TESTED: 3,
        TEST_FAILED: -3
    },
    STATUS: {
        RUNNING: 0,
        SUCCESSED: 1,
        FAILED: -1
    },
    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                obj.created_date = new Date();
                obj.updated_date = new Date(); 
                if(!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                if(!utils.has(obj.params)) throw new restify.BadRequestError('params is required!');
				if(!utils.has(obj.shellinstance_id)) throw new restify.BadRequestError('shellinstance_id is required!');
				obj.status = exports.STATE.CREATED;
                obj.pos = obj.pos || 0;
                break;
        }
        return obj;
    },
    execute(_id){
        return new Promise((resolve, reject) => {
            exports.get(_id).then((testInstance) => {
                if([exports.STATE.TESTING].includes(testInstance.status)){
                    exports.update({
                        _id,
                        status: exports.STATE.TESTING
                    }).then(() => {
                        try {
                            let ExecutingLogs = require('./ExecutingLogs.service');
                            ExecutingLogs.insert({
                                event_type: ExecutingLogs.EVENT_TYPE.RUN_TESTING,
                                status: ExecutingLogs.STATUS.RUNNING,
                                title: testInstance.name,
                                event_name: "RUN TESTING",
                                testinstance_id: _id
                            }).then((rs) => {
                                let ShellInstanceService = require('./ShellInstance.service');
                                ShellInstanceService.get(testInstance.shellinstance_id).then((shellInstance) => {
                                    let ShellClassService = require('./ShellClass.service');
                                    ShellClassService.get(shellInstance.shellclass_id).then((shellClass) => {
                                        let data = {
                                            SessionId: rs.insertedIds[0].toString(),
                                            Tasks: shellClass.testing.tasks,
                                            Parameters: testInstance.params,                                
                                            InstanceData: shellInstance.inputData,
                                            From: appconfig.rabbit.api.queueName
                                        };
                                        let BroadcastService = require('./Broadcast.service');
                                        BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.runTesting.exchange, appconfig.rabbit.runTesting.queueName, appconfig.rabbit.runTesting.exchangeType, data).then((data) => {
                                            resolve(data);
                                        }).catch(reject); 
                                    });
                                }).catch(reject);                            
                            }).catch(reject);
                        } catch (e) {
                            reject(e);
                        }
                    }).catch(reject);
                }
            }).catch(reject);
        });
    },
    find: (fil={}) => {
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
                    db.update(obj, db.DONE).then(resolve).catch(reject);
                }).catch(reject)
            } catch (e) {
                reject(e);
            }
        });
    },
    delete: (_id) => {
        return new Promise((resolve, reject) => {
            db.open(exports.COLLECTION).then((db) => {
                db.delete(_id, db.DONE).then(resolve).catch(reject);
            }).catch(reject)
        });
    }
}