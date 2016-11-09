let DB = require('../db');
let fs = require('fs');
let path = require('path');
let AdmZip = require('adm-zip');
let amqp = require('amqplib/callback_api');

let utils = require('../utils');
let executingLogs = require('./ExecutingLogs.service')();

/************************************
 ** SERVICE:      ShellClassController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/7/2016, 2:02:46 PM
 *************************************/

module.exports = () => {
    let db = DB('ShellClass');
    let self = {

        broadcast: (channelName, type, data) => {
            return new Promise((resolve, reject) => {
                amqp.connect(appconfig.rabbit.url, function (err, conn) {
                    conn.createChannel(function (err, ch) {
                        ch.assertExchange(channelName, type, {
                            durable: false
                        });
                        ch.publish(channelName, type, new Buffer(JSON.stringify(data)));
                        resolve(data);
                    });
                    setTimeout(() => {
                        if (conn) conn.close;
                    }, appconfig.rabbit.timeout);
                });
            });
        },

        broadcastIO: (sessionId, data) => {
            try {
                let socket = global.ioer[sessionId];
                if (socket) {
                    if (socket.connected) {
                        socket.emit('completed', data);
                    }else{
                        delete global.ioer[sessionId];
                    }
                }
            } catch (e) {
                console.log('broadcastIO ' + sessionId);
            }
        },

        updateResult: (executingLogId, data) => {
            return new Promise((resolve, reject) => {
                executingLogs.get(executingLogId).then((item) => {
                    item.status = data.error ? executingLogs.STATUS.FAILED : executingLogs.STATUS.SUCCESSED;
                    item.result = data; 
                    executingLogs.update(item).then((rs) => {
                        self.broadcastIO(executingLogId, item);
                        resolve(item);
                    }).catch(reject); 
                }).catch(reject);
            });
        },

        // Call via rabbit mq to execute script
        execute: (_id, data) => {
            return new Promise((resolve, reject) => {
                self.get(_id).then((item) => {
                    try {
                        data = self.validate(data, 3);
                        executingLogs.insert({
                            event_type: executingLogs.EVENT_TYPE.EXECUTING,
                            status: executingLogs.STATUS.RUNNING,
                            title: item.name,
                            shellclass_id: item._id
                        }).then((rs) => {
                            data['#'] = rs.insertedIds[0].toString();
                            data['#NS'] = item._id;
                            self.broadcast(item.target, appconfig.rabbit.executing.channelType, data).then((data) => {
                                resolve(data);
                            }).catch(reject);
                        }).catch(reject);
                    } catch (e) {
                        reject(e);
                    }
                });

            });
        },

        // Call via rabbit mq to install
        install: (_id) => {
            return new Promise((resolve, reject) => {
                try {
                    self.get(_id).then((item) => {
                        let data = {
                            target: item.target,
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
                            data['#NS'] = item._id;
                            self.broadcast(appconfig.rabbit.installing.channelName, appconfig.rabbit.installing.channelType, data).then((data) => {
                                resolve(data);
                            }).catch(reject);
                        }).catch(reject);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        },

        updateUploadingShell: (_id, shellPath) => {
            return new Promise((resolve, reject) => {
                self.get(_id).then((item) => {
                    let oldShell = path.join(__dirname, '..', '..', 'assets', item.content);
                    let newShell = path.join(__dirname, '..', '..', 'assets', shellPath);
                    self.handleShellFile(newShell).then((meta) => {
                        try {
                            let obj = {
                                _id: _id,
                                name: meta.name,
                                des: meta.des,
                                target: meta.target,
                                input: meta.input,
                                content: shellPath
                            };
                            self.validate(obj, 1);
                            self.update(obj).then((rs) => {
                                try {
                                    fs.statSync(oldShell);
                                    fs.unlinkSync(oldShell);
                                } catch (e) {
                                    console.log('Not found file');
                                }
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
                            input: meta.input,
                            target: meta.target,
                            content: newShell
                        };
                        self.validate(obj, 0);
                        self.insert(obj).then((rs) => {
                            resolve(rs);
                        }).catch(reject);
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
                    if (!utils.has(obj.name)) throw new Error('name is required!');
                    if (!utils.has(obj.target)) throw new Error('target is required!');
                    break;
                case 1: // For updating
                    if (!utils.has(obj._id)) throw new Error('_id is required!');
                    if (!utils.has(obj.name)) throw new Error('name is required!');
                    if (!utils.has(obj.target)) throw new Error('target is required!');
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
            return db().open().then((db) => {
                db.delete(_id);
            }).catch(reject);
        }
    };
    return self;
}