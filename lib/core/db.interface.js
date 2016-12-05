let _ = require('lodash');

/************************************
 ** DATABASE INTERFACE
 ** Note
 ** Implement for your database
 *************************************/

exports = module.exports = {
    uuid: (id) => {
        return null;
    },
    open: (collection) => {
        let func = {
            DONE: 0,
            SUCCESS: 1,
            FAIL: -1,
            db: undefined,
            collection: collection,
            find: ({
                where,
                fields,
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