let restify = require('restify');
let path = require('path');
let _ = require('lodash');

let db = require('../db');
let utils = require('../utils');

/************************************
 ** SERVICE:      ShellInstanceController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/24/2016, 4:49:06 PM
 *************************************/

exports = module.exports = {
    COLLECTION: 'ShellInstance',
    STATUS: {
        RUNNING: 0,
        SUCCESSED: 1,
        FAILED: -1
    },
    bindDataInShellInstanceScript: (data, bindingData) => {
        for (var i in data) {
            if (typeof data[i] === 'string') {
                let m = data[i].match(/\$\{([^\}]+)\}$/);
                if(m) data[i] = eval(`bindingData.${m[1]}`);
            }
        }
        return data;
    },
    // Call via rabbit mq to execute script
    executeScript: (_id, name) => {
        return new Promise((resolve, reject) => {
            exports.get(_id).then((shellInstance) => {
                let ShellClassService = require('./ShellClass.service');
                ShellClassService.get(shellInstance.shellclass_id).then((shellClass) => {
                    try {
                        let scripts = shellClass.scripts;
                        if (!scripts || !scripts[name]) {
                            return reject(`Could not find command at "${name}" in plugin ${index}`);
                        }                        
                        let ExecutingLogs = require('./ExecutingLogs.service');
                        ExecutingLogs.insert({
                            event_type: ExecutingLogs.EVENT_TYPE.SCRIPT,
                            status: ExecutingLogs.STATUS.RUNNING,
                            title: shellInstance.name,
                            event_name: name,
                            shellinstance_id: _id
                        }).then((rs) => {
                            let data = _.clone(scripts[name].data);
                            data = data === undefined ? undefined : exports.bindDataInShellInstanceScript(data, _.assign({
                                '#': rs.insertedIds[0].toString(),
                                inputData: shellInstance.inputData
                            }, shellClass));
                            let BroadcastService = require('./Broadcast.service');
                            // TODO: Thieu queue name va queue type
                            BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.getInfor.exchange, appconfig.rabbit.getInfor.name, appconfig.rabbit.getInfor.exchangeType, data).then((data) => {
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

    getInformation: (_id) => {
        return new Promise((resolve, reject) => {
            exports.get(_id).then((shellInstance) => {                
                try {
                    let ExecutingLogs = require('./ExecutingLogs.service');
                    ExecutingLogs.insert({
                        event_type: ExecutingLogs.EVENT_TYPE.GET_INFORMATION,
                        status: ExecutingLogs.STATUS.RUNNING,
                        title: shellInstance.name,
                        event_name: 'GET INFORMATION',
                        shellinstance_id: _id
                    }).then((rs) => {
                        let data = {
                            '#': rs.insertedIds[0].toString(),
                            cloud_ip: appconfig.rabbit.cloud_ip,
                            deployment_name: shellInstance.name
                        };
                        let BroadcastService = require('./Broadcast.service');
                        BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.getInfor.exchange, appconfig.rabbit.channel.getInfor.name, appconfig.rabbit.channel.getInfor.exchangeType, data).then((data) => {
                            resolve(data);
                        }).catch(reject);
                    }).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });

        });
    },

    createInstance: (shellInstance) => {
        return new Promise((resolve, reject) => {
            try {
                let ShellClassService = require('./ShellClass.service');
                ShellClassService.get(shellInstance.shellclass_id).then((shellClass) => {
                    let ExecutingLogs = require('./ExecutingLogs.service');
                    ExecutingLogs.insert({
                        event_type: ExecutingLogs.EVENT_TYPE.CREATE_INSTANCE,
                        status: ExecutingLogs.STATUS.RUNNING,
                        title: shellInstance.name,
                        shellinstance_id: shellInstance._id
                    }).then((rs) => {
                        let data = {
                            '#': rs.insertedIds[0].toString(),
                            Command: appconfig.rabbit.channel.createInstance.cmd,
                            Params: {
                                deployment_name: shellInstance.name,
                                blueprint_id: shellClass.name,
                                cloud_ip: appconfig.rabbit.cloud_ip,
                                input_string: _.clone(shellInstance.inputData),
                            },
                            From: appconfig.rabbit.api.queueName
                        }
                        let BroadcastService = require('./Broadcast.service');
                        BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.createInstance.exchange, appconfig.rabbit.channel.createInstance.name, appconfig.rabbit.channel.createInstance.exchangeType, data).then((data) => {
                            resolve(data);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },

    deployInstance: (_id) => {
        return new Promise((resolve, reject) => {
            exports.get(_id).then((shellInstance) => {
                try {
                    let ExecutingLogs = require('./ExecutingLogs.service');
                    ExecutingLogs.insert({
                        event_type: ExecutingLogs.EVENT_TYPE.DEPLOY_INSTANCE,
                        status: ExecutingLogs.STATUS.RUNNING,
                        title: shellInstance.name,
                        shellinstance_id: shellInstance._id
                    }).then((rs) => {
                        let data = {
                            '#': rs.insertedIds[0].toString(),
                            Command: appconfig.rabbit.channel.deployInstance.cmd,
                            Params: {
                                cloud_ip: appconfig.rabbit.cloud_ip,
                                deployment_name: shellInstance.name,
                            },
                            From: appconfig.rabbit.api.queueName
                        };
                        let BroadcastService = require('./Broadcast.service');
                        BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.deployInstance.exchange, appconfig.rabbit.channel.deployInstance.name, appconfig.rabbit.channel.deployInstance.exchangeType, data).then((data) => {
                            resolve(data);
                        }).catch(reject);
                    }).catch(reject);
                } catch (e) {
                    reject(e);
                }
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
                            let data = _.clone(index === undefined ? shellInstance.data : shellInstance.data.shell_instances[index]);
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

    // // Call via rabbit mq to install
    // install: (shellInstance) => {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             let ShellClassService = require('./ShellClass.service');
    //             ShellClassService.get(shellInstance.data.shellclass_id).then((item) => {
    //                 let data = {
    //                     cloud_ip: '10.64.0.162',
    //                     blueprint_id: shellInstance.name,
    //                     archive_file_link: `${appconfig.staticUrl}${item.content}`,
    //                     blueprint_file_name: shellInstance.yaml
    //                 };
    //                 let ExecutingLogs = require('./ExecutingLogs.service');
    //                 ExecutingLogs.insert({
    //                     event_type: ExecutingLogs.EVENT_TYPE.INSTALLING,
    //                     status: ExecutingLogs.STATUS.RUNNING,
    //                     title: item.name,
    //                     shellinstance_id: shellInstance._id,
    //                     started_time: new Date()
    //                 }).then((rs) => {
    //                     data['#'] = rs.insertedIds[0].toString();
    //                     let BroadcastService = require('./Broadcast.service');
    //                     BroadcastService.broadcastToRabQ(appconfig.rabbit.installing.channelName, appconfig.rabbit.installing.channelType, data).then((data) => {
    //                         resolve(data);
    //                     }).catch(reject);
    //                 }).catch(reject);
    //             });
    //         } catch (e) {
    //             reject(e);
    //         }
    //     });
    // },

    validate: (obj, action) => {
        switch (action) {
            case 0: // For inserting
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