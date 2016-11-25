let restify = require('restify');
let path = require('path');
var extend = require('util')._extend;
                                
let DB = require('../db');
let utils = require('../utils');
let BroadcastService = require('./Broadcast.service');
let ShellClassService = require('./ShellClass.service')();
let executingLogs = require('./ExecutingLogs.service')();

/************************************
** SERVICE:      ShellInstanceController
** AUTHOR:       Unknown
** CREATED DATE: 11/24/2016, 4:49:06 PM
*************************************/

module.exports = () => {
    let db = DB('ShellInstance');
    let self = {
        bindDataInShellInstanceScript: (data, shellInstance) => {
            for(var i in data){
                if(/\$\{[^\}]+\}/.test(data[i])){
                    data[i] = shellInstance[i];
                }
            }
            return data;
        },
        // Call via rabbit mq to execute script
        executeScript: (_id, parentIndex, index) => {
            return new Promise((resolve, reject) => {
                self.get(_id).then((shellInstance) => {
                    ShellClassService.get(shellInstance.data.shellclass_id).then((shellClass) => {
                        try {
                            let scripts = index === undefined ? shellClass.scripts : shellClass.plugins[index].scripts;
                            if(!scripts || !scripts[parentIndex]) {
                                return reject(`Could not find command at "${parentIndex}" in plugin ${index}`);
                            }
                            let data = extend({}, scripts[parentIndex]);
                            // TODO: check data truoc khi gui ? data = self.validate(data, 3);
                            executingLogs.insert({
                                event_type: executingLogs.EVENT_TYPE.SCRIPT,
                                status: executingLogs.STATUS.RUNNING,
                                title: shellClass.name,
                                event_name: data.name,
                                shellclass_id: shellInstance.data.shellclass_id
                            }).then((rs) => {                                
                                delete data.name;
                                data = self.bindDataInShellInstanceScript(data, index === undefined ? shellInstance.data : shellInstance.shell_instances[index]);
                                data['#'] = rs.insertedIds[0].toString();
                                data['#NS'] = shellClass._id.toString();
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
                self.get(_id).then((shellInstance) => {
                    ShellClassService.get(shellInstance.data.shellclass_id).then((shellClass) => {
                        try {
                            // TODO: check data truoc khi gui ? data = self.validate(data, 3);
                            executingLogs.insert({
                                event_type: executingLogs.EVENT_TYPE.EXECUTING,
                                status: executingLogs.STATUS.RUNNING,
                                title: shellClass.name,
                                shellclass_id: shellInstance.data.shellclass_id
                            }).then((rs) => {
                                let data = extend({}, index === undefined ? shellInstance.data : shellInstance.shell_instances[index]);
                                data['#'] = rs.insertedIds[0].toString();
                                data['#NS'] = shellClass._id.toString();
                                delete data.shellclass_id;
                                delete data.target;
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
                    ShellClassService.get(shellInstance.shellclass_id).then((item) => {
                        let data = {
                            '#NS': item._id,
                            target: shellInstance.target,
                            link: `${appconfig.staticUrl}${item.content}`
                        };
                        executingLogs.insert({
                            event_type: executingLogs.EVENT_TYPE.INSTALLING,
                            status: executingLogs.STATUS.RUNNING,
                            title: item.name,
                            shellclass_id: item._id,
                            started_time: new Date()
                        }).then((rs) => {
                            data['#'] = rs.insertedIds[0].toString();                                                       
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
                    if(!utils.has(obj.data.target)) throw new restify.BadRequestError('target is required!');
                    break;
                case 1: // For updating
                    if(!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
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
            return new Promise((resolve, reject0) => {
                try {
                    self.validate(obj, 1);
                    db().open().then((db) => {
                        db.update(obj).then(resolve).catch(reject0);
                    }).catch(reject0)
                } catch (e) {
                    
                    reject0(e);
                }
            });
        },

        delete: (_id) => {
            return new Promise((resolve, reject0) => {
                db().open().then((db) => {
                    db.delete(_id).then(resolve).catch(reject0);
                }).catch(reject0)
            });
        }
    };
    return self;
}