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
    open: (collection) => {
        let func = {
            DONE: 0,
            SUCCESS: 1,
            FAIL: -1,
            db: undefined,
            collection: collection,
            find: ({
                where = {},
                fields = {},
                sortBy,
                page = 1,
                recordsPerPage = 20
            }, opts = func.DONE) => {
                opts = typeof opts === 'object' ? opts : { close: opts };
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(opts.collection || func.collection);
                    let query = collection.find(where, fields);
                    if (sortBy) query = query.sort(sortBy);
                    if (page) query = query.skip((page - 1) * recordsPerPage);
                    if (recordsPerPage) query = query.limit(recordsPerPage);
                    query.toArray((err, result) => {
                        if(opts.close === func.DONE) func.close();
                        if (err) {
                            if(opts.close === func.FAIL) func.close();
                            return reject(err);
                        }
                        if(opts.close === func.SUCCESS) func.close();
                        resolve(result);
                    });
                });
            },
            get: (_id, opts = { close : func.DONE }) => {
                opts = typeof opts === 'object' ? opts : { close: opts };
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(opts.collection || func.collection);
                    collection.find({
                        _id: exports.uuid(_id)
                    }).toArray((err, result) => {
                        if(opts.close === func.DONE) func.close();
                        if (err) {
                            if(opts.close === func.FAIL) func.close();
                            return reject(err);
                        }
                        if(opts.close === func.SUCCESS) func.close();
                        resolve(result.length > 0 ? result[0] : undefined);
                    });
                });
            },
            insert: (obj, opts = { close : func.DONE }) => {
                opts = typeof opts === 'object' ? opts : { close: opts };
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(opts.collection || func.collection);
                    if (obj instanceof Array) {
                        collection.insertMany(obj, (err, result) => {
                            if(opts.close === func.DONE) func.close();
                            if (err) {
                                if(opts.close === func.FAIL) func.close();
                                return reject(err);
                            }
                            if(opts.close === func.SUCCESS) func.close();
                            resolve(result);
                        });
                    } else {
                        collection.insert(obj, (err, result) => {
                            if(opts.close === func.DONE) func.close();
                            if (err) {
                                if(opts.close === func.FAIL) func.close();
                                return reject(err);
                            }
                            if(opts.close === func.SUCCESS) func.close();
                            resolve(result);
                        });
                    }
                });
            },
            update: (obj0, opts = { close : func.DONE }) => {
                opts = typeof opts === 'object' ? opts : { close: opts };
                let obj = _.cloneDeep(obj0);
                delete obj._id;
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(opts.collection || func.collection);
                    collection.updateOne({
                        _id: exports.uuid(obj0._id)
                    }, {
                        $set: obj
                    }, (err, result) => {
                        if(opts.close === func.DONE) func.close();
                        if (err) {
                            if(opts.close === func.FAIL) func.close();
                            return reject(err);
                        }
                        if(opts.close === func.SUCCESS) func.close();
                        resolve(result);
                    });
                });
            },
            delete: (_id, opts = { close : func.DONE }) => {
                opts = typeof opts === 'object' ? opts : { close: opts };
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(opts.collection || func.collection);
                    collection.deleteOne({
                        _id: exports.uuid(_id)
                    }, (err, result) => {
                        if(opts.close === func.DONE) func.close();
                        if (err) {
                            if(opts.close === func.FAIL) func.close();
                            return reject(err);
                        }
                        if(opts.close === func.SUCCESS) func.close();
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