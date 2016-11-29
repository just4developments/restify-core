let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

/************************************
 ** DATABASE ADAPTER
 ** Note
 ** Implement for your database
 *************************************/

exports = module.exports = {
    uuid: (id) => {
        return ObjectID(id);
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
            }, closeMode) => {
                return new Promise((resolve, reject) => {
                    
                });
            },
            get: (_id, closeMode) => {
                return new Promise((resolve, reject) => {
                    
                });
            },
            insert: (obj, closeMode) => {
                return new Promise((resolve, reject) => {
                    
                });
            },
            update: (obj0, closeMode) => {
                return new Promise((resolve, reject) => {
                    
                });
            },
            delete: (_id, closeMode) => {
                return new Promise((resolve, reject) => {
                    
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
            func.db = db;
            resolve(func);            
        });
    }
}