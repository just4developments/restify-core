let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

/************************************
 ** DATABASE ADAPTER FOR MONGODB
 ** Installation
 ** `npm install mongodb --save`
 *************************************/

module.exports = {
    uuid: (id) => {
        return ObjectID(id);
    },
    open: (tbl) => {
        let func = {
            db: undefined,
            tbl: tbl,
            find: ({
                where = {},
                fields = {},
                sortBy,
                page = 1,
                recordsPerPage = 20
            }, isAutoClose) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    let query = collection.find(where, fields);
                    if (sortBy) query = query.sort(sortBy);
                    if (page) query = query.skip((page - 1) * recordsPerPage);
                    if (recordsPerPage) query = query.limit(recordsPerPage);
                    query.toArray((err, result) => {
                        if(isAutoClose) func.close();
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            },
            get: (_id, isAutoClose) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.find({
                        _id: self.uuid(_id)
                    }).toArray((err, result) => {
                        if(isAutoClose) func.close();
                        if (err) return reject(err);
                        resolve(result.length > 0 ? result[0] : undefined);
                    });
                });
            },
            insert: (obj, isAutoClose) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    if (obj instanceof Array) {
                        collection.insertMany(obj, (err, result) => {
                            if(isAutoClose) func.close();
                            if (err) return reject(err);
                            resolve(result);
                        });
                    } else {
                        collection.insert(obj, (err, result) => {
                            if(isAutoClose) func.close();
                            if (err) return reject(err);
                            resolve(result);
                        });
                    }
                });
            },
            update: (obj0, isAutoClose) => {
                let obj = obj0 instanceof Array ? [] : {};
                for (var i in obj0) {
                    if (i !== '_id') {
                        obj[i] = obj0[i];
                    }
                }
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.updateOne({
                        _id: self.uuid(obj0._id)
                    }, {
                        $set: obj
                    }, (err, result) => {
                        if(isAutoClose) func.close();
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            },
            delete: (_id, isAutoClose) => {
                return new Promise((resolve, reject) => {
                    let collection = func.db.collection(func.tbl);
                    collection.deleteOne({
                        _id: self.uuid(_id)
                    }, (err, result) => {
                        if(isAutoClose) func.close();
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            },
            close: () => {
                if (func.db) func.db.close();
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