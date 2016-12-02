let restify = require('restify');
let path = require('path');
var extend = require('util')._extend;

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      ShellInstanceController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/24/2016, 4:49:06 PM
 *************************************/

exports = module.exports = {
    COLLECTION: 'ShellInstance',

    bindDataInShellInstanceScript: (data, shellInstance) => {
        for (var i in data) {
            if (/\$\{[^\}]+\}/.test(data[i])) {
                data[i] = shellInstance[i];
            }
        }
        return data;
    },
    // Call via rabbit mq to execute script
    executeScript: (_id, parentIndex, index) => {
        return new Promise((resolve, reject) => {
            exports.get(_id).then((shellInstance) => {
                let ShellClassService = require('./ShellClass.service');
                ShellClassService.get(shellInstance.data.shellclass_id).then((shellClass) => {
                    try {
                        let scripts = index === undefined ? shellClass.scripts : shellClass.plugins[index].scripts;
                        if (!scripts || !scripts[parentIndex]) {
                            return reject(`Could not find command at "${parentIndex}" in plugin ${index}`);
                        }
                        let data = extend({}, scripts[parentIndex]);
                        let ExecutingLogs = require('./ExecutingLogs.service');
                        ExecutingLogs.insert({
                            event_type: ExecutingLogs.EVENT_TYPE.SCRIPT,
                            status: ExecutingLogs.STATUS.RUNNING,
                            title: shellClass.name,
                            event_name: data.name,
                            shellinstance_id: _id
                        }).then((rs) => {
                            delete data.name;
                            data = exports.bindDataInShellInstanceScript(data, index === undefined ? shellInstance.data : shellInstance.data.shell_instances[index]);
                            data['#'] = rs.insertedIds[0].toString();
                            data['#NS'] = shellClass._id.toString();
                            let BroadcastService = require('./Broadcast.service');
                            BroadcastService.broadcastToRabQ(shellInstance.data.target, appconfig.rabbit.executing.channelType, data).then((data) => {
                                resolve(data);
                            }).catch(reject);
                        }).catch(reject);
                    } catch (e) {
                        reject(e);
                    }
                }).catch(reject);
            });

        });
    },

    // Call via rabbit mq to execute script
    execute: (_id, index) => {
        return new Promise((resolve, reject) => {
            exports.get(_id).then((shellInstance) => {
                let ShellClassService = require('./ShellClass.service');
                ShellClassService.get(shellInstance.data.shellclass_id).then((shellClass) => {
                    try {
                        let ExecutingLogs = require('./ExecutingLogs.service');
                        ExecutingLogs.insert({
                            event_type: ExecutingLogs.EVENT_TYPE.EXECUTING,
                            status: ExecutingLogs.STATUS.RUNNING,
                            title: shellClass.name,
                            shellinstance_id: _id
                        }).then((rs) => {
                            let data = extend({}, index === undefined ? shellInstance.data : shellInstance.data.shell_instances[index]);
                            data['#'] = rs.insertedIds[0].toString();
                            data['#NS'] = shellClass._id.toString();
                            delete data.shellclass_id;
                            delete data.target;
                            let BroadcastService = require('./Broadcast.service');
                            BroadcastService.broadcastToRabQ(shellInstance.data.target, appconfig.rabbit.executing.channelType, data).then((data) => {
                                resolve(data);
                            }).catch(reject);
                        }).catch(reject);
                    } catch (e) {
                        reject(e);
                    }
                }).catch(reject);
            });

        });
    },

    // Call via rabbit mq to install
    install: (shellInstance) => {
        return new Promise((resolve, reject) => {
            try {
                let ShellClassService = require('./ShellClass.service');
                ShellClassService.get(shellInstance.data.shellclass_id).then((item) => {
                    let data = {
                        '#NS': item._id,
                        target: shellInstance.data.target,
                        link: `${appconfig.staticUrl}${item.content}`
                    };
                    let ExecutingLogs = require('./ExecutingLogs.service');
                    ExecutingLogs.insert({
                        event_type: ExecutingLogs.EVENT_TYPE.INSTALLING,
                        status: ExecutingLogs.STATUS.RUNNING,
                        title: item.name,
                        shellinstance_id: shellInstance._id,
                        started_time: new Date()
                    }).then((rs) => {
                        data['#'] = rs.insertedIds[0].toString();
                        let BroadcastService = require('./Broadcast.service');
                        BroadcastService.broadcastToRabQ(appconfig.rabbit.installing.channelName, appconfig.rabbit.installing.channelType, data).then((data) => {
                            resolve(data);
                        }).catch(reject);
                    }).catch(reject);
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
                if (!utils.has(obj.data.target)) throw new restify.BadRequestError('target is required!');
                break;
            case 1: // For updating
                if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
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
        return new Promise((resolve, reject0) => {
            try {
                exports.validate(obj, 1);
                db.open(exports.COLLECTION).then((db) => {
                    db.update(obj).then(resolve).catch(reject0);
                }).catch(reject0)
            } catch (e) {

                reject0(e);
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