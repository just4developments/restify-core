let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

/************************************
 ** DATABASE ADAPTER FOR MONGODB
 ** Installation
 ** `npm install mongodb --save`
 *************************************/

exports = module.exports = (tbl) => {
    return (db, isManualClose) => {
        let self = this;
        this.uuid = (id) => {
            return ObjectID(id);
        };
        this.open = () => {
            return new Promise((resolve, reject) => {
                MongoClient.connect(global.appconfig.db.url, function (err, db0) {
                    if (err) return reject(err);
                    db = db0;
                    resolve(self);
                });
            });
        };
        this.close = () => {
            if (db) db.close();
        };
        this.find = ({
            where,
            sortBy,
            page = 1,
            recordsPerPage = 20
        }) => {
            return new Promise((resolve, reject) => {
                let collection = db.collection(tbl);
                collection.find(where).toArray((err, result) => {
                    if (!isManualClose || err) self.close();
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };
        this.get = (_id) => {
            return new Promise((resolve, reject) => {
                let collection = db.collection(tbl);
                collection.find({_id: self.uuid(_id)}).toArray((err, result) => {
                    if (!isManualClose || err) self.close();
                    if (err) return reject(err);
                    resolve(result.length > 0 ? result[0] : undefined);
                });
            });
        };
        this.insert = (obj) => {
            return new Promise((resolve, reject) => {
                let collection = db.collection(tbl);
                if (obj instanceof Array) {
                    collection.insertMany(obj, (err, result) => {
                        if (!isManualClose || err) self.close();
                        if (err) return reject(err);
                        resolve(result);
                    });
                } else {
                    collection.insert(obj, (err, result) => {
                        if (!isManualClose || err) self.close();
                        if (err) return reject(err);
                        resolve(result);
                    });
                }
            });
        };
        this.update = (obj0) => {
            let obj = obj0 instanceof Array ? [] : {};
            for(var i in obj0){
                if(i !== '_id'){
                    obj[i] = obj0[i];
                }
            }
            return new Promise((resolve, reject) => {
                let collection = db.collection(tbl);                
                collection.updateOne({_id: self.uuid(obj0._id)}, {
                    $set: obj
                }, (err, result) => {
                    if (!isManualClose || err) self.close();
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };
        this.delete = (_id) => {
            return new Promise((resolve, reject) => {
                let collection = db.collection(tbl);
                collection.deleteOne({_id: self.uuid(_id)}, (err, result) => {
                    if (!isManualClose || err) self.close();
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        };
        return this;
    }
}