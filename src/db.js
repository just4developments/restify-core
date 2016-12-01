let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let _ = require('lodash');

/************************************
 ** DATABASE ADAPTER FOR MONGODB
 ** Installation
 ** `npm install mongodb --save`
 *************************************/

exports = module.exports = {
    uuid: (id) => {
        return typeof id === 'string' ? ObjectID(id) : id;
    },
    open: (tbl) => {
        let func = {
            CLOSE_AFTER_DONE: 0,
            CLOSE_AFTER_SUCCESS: 1,
            CLOSE_AFTER_ERROR: -1,
            db: undefined,
            tbl: tbl,
            find: ({
                where = {},
                fields = {},
                sortBy,
                page = 1,
                recordsPerPage = 20
            }, closeMode = func.CLOSE_AFTER_DONE) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    let query = collection.find(where, fields);
                    if (sortBy) query = query.sort(sortBy);
                    if (page) query = query.skip((page - 1) * recordsPerPage);
                    if (recordsPerPage) query = query.limit(recordsPerPage);
                    query.toArray((err, result) => {
                        if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                        if (err) {
                            if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                            return reject(err);
                        }
                        if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                        resolve(result);
                    });
                });
            },
            get: (_id, closeMode = func.CLOSE_AFTER_DONE) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.find({
                        _id: exports.uuid(_id)
                    }).toArray((err, result) => {
                        if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                        if (err) {
                            if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                            return reject(err);
                        }
                        if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                        resolve(result.length > 0 ? result[0] : undefined);
                    });
                });
            },
            insert: (obj, closeMode = func.CLOSE_AFTER_DONE) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    if (obj instanceof Array) {
                        collection.insertMany(obj, (err, result) => {
                            if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                            if (err) {
                                if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                                return reject(err);
                            }
                            if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                            resolve(result);
                        });
                    } else {
                        collection.insert(obj, (err, result) => {
                            if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                            if (err) {
                                if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                                return reject(err);
                            }
                            if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                            resolve(result);
                        });
                    }
                });
            },
            update: (obj0, closeMode = func.CLOSE_AFTER_DONE) => {
                let obj = _.cloneDeep(obj0);
                delete obj._id;
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.updateOne({
                        _id: exports.uuid(obj0._id)
                    }, {
                        $set: obj
                    }, (err, result) => {
                        if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                        if (err) {
                            if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                            return reject(err);
                        }
                        if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                        resolve(result);
                    });
                });
            },
            delete: (_id, closeMode = func.CLOSE_AFTER_DONE) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.deleteOne({
                        _id: exports.uuid(_id)
                    }, (err, result) => {
                        if(closeMode === func.CLOSE_AFTER_DONE) func.close();
                        if (err) {
                            if(closeMode === func.CLOSE_AFTER_ERROR) func.close();
                            return reject(err);
                        }
                        if(closeMode === func.CLOSE_AFTER_SUCCESS) func.close();
                        resolve(result);
                    });
                });
            },
            close: () => {
                if (func.db) {
                    func.db.close();
                    delete func.db;
                }
            }
        };
        return new Promise((resolve, reject) => {
            MongoClient.connect(global.appconfig.db.url, function (err, db) {
                if (err) return reject(err);
                func.db = db;
                resolve(func);
            });
        });
    }
}