let restify = require('restify');
let fs = require('fs');
let path = require('path');
let AdmZip = require('adm-zip');

let DB = require('../db');
let utils = require('../utils');
let BroadcastService = require('./Broadcast.service');
let executingLogs = require('./ExecutingLogs.service')();

/************************************
 ** SERVICE:      ShellClassController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/7/2016, 2:02:46 PM
 *************************************/

module.exports = () => {
    let db = DB('ShellClass');
    let self = {

        updateResult: (executingLogId, data) => {
            return new Promise((resolve, reject) => {
                executingLogs.get(executingLogId).then((item) => {
                    item.status = data.error ? executingLogs.STATUS.FAILED : executingLogs.STATUS.SUCCESSED;
                    item.result = data; 
                    executingLogs.update(item).then((rs) => {
                        setTimeout(() => {
                            BroadcastService.broadcastToWeb(executingLogId, item);
                        }, 2000);                        
                        resolve(item);
                    }).catch(reject); 
                }).catch(reject);
            });
        },

        updateUploadingShell: (_id, shellPath) => {
            return new Promise((resolve, reject) => {
                self.get(_id).then((item) => {
                    let newShell = path.join(__dirname, '..', '..', 'assets', shellPath);
                    self.handleShellFile(newShell).then((meta) => {
                        try {
                            let obj = {
                                _id: _id,
                                name: meta.name,
                                des: meta.des,        
                                scripts: meta.scripts,                        
                                input: meta.input,
                                plugins: meta.plugins,
                                content: shellPath,
                                updated_date: new Date()
                            };
                            self.validate(obj, 1);
                            self.update(obj).then((rs) => {
                                utils.deleteFile(utils.getAbsoluteUpload(item.content));
                                resolve(rs);
                            }).catch(reject);
                        } catch (e) {
                            reject(e);
                        }
                    }).catch(reject);
                }).catch(reject);
            })
        },

        insertUploadingShell: (newShell) => {
            return new Promise((resolve, reject) => {
                self.handleShellFile(path.join(__dirname, '..', '..', 'assets', newShell)).then((meta) => {
                    try {
                        let obj = {
                            name: meta.name,
                            des: meta.des,
                            scripts: meta.scripts,
                            input: meta.input,
                            plugins: meta.plugins,
                            content: newShell,
                            created_date: new Date(),
                            updated_date: new Date()
                        };
                        self.validate(obj, 0);
                        self.insert(obj).then(resolve).catch(reject);
                    } catch (e) {
                        reject(e);
                    }
                }).catch(reject);
            });
        },

        handleShellFile: (inputFile) => {
            return new Promise((resolve, reject) => {
                var zip = new AdmZip(inputFile);
                let hasMeta = false;
                let hasSh = false;
                let meta;
                zip.getEntries().forEach(function (zipEntry) {
                    if (/config\.json$/.test(zipEntry.entryName)) {
                        hasMeta = true;
                        try {
                            meta = zipEntry.getData().toString();
                            meta = JSON.parse(meta);
                            utils.validateJson(meta, require('../validation/ShellClass.validation'));
                        } catch (e) {
                            reject(e);
                        }
                    } else if (/(index\.sh$)|(index\.bat$)/.test(zipEntry.entryName)) {
                        hasSh = true;
                    }
                });
                if (!hasMeta) {
                    reject(new Error('Need file config.json in plugin'));
                } else if (!hasSh) {
                    reject(new Error('Need file index.(sh or bat) in plugin'));
                } else {
                    resolve(meta);
                }
            });
        },

        validate: (obj, action) => {
            switch (action) {
                case 0: // For inserting
                    // if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                    // if (!utils.has(obj.target)) throw new restify.BadRequestError('target is required!');
                    break;
                case 1: // For updating
                    if (!utils.has(obj._id)) throw new restify.BadRequestError('_id is required!');
                    // if (!utils.has(obj.name)) throw new restify.BadRequestError('name is required!');
                    // if (!utils.has(obj.target)) throw new restify.BadRequestError('target is required!');
                    break;
                case 3: // For executing                    
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
            return new Promise((resolve, reject) => {
                db().open().then((db) => {
                    db.delete(_id).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
    };
    return self;
}