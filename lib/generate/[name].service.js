let DB = require('../db');
let utils = require('../utils');

/************************************
** SERVICE:      ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

module.exports = () => {
    let db = DB('${tbl}');
    let self = {

        validate: (obj, action) => {
            switch (action) {
                case 0: // For inserting
                    ${ivalidation}
                    break;
                case 1: // For updating
                    ${uvalidation}
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

        get: (${key}) => {
            return new Promise((resolve, reject) => {
                db().open().then((db) => {
                    db.get(${key}).then(resolve).catch(reject);; 
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
                    ${removeFileWhenUpdate}                   
                } catch (e) {
                    reject(e);
                }
            });
        },

        delete: (${key}) => {
            return new Promise((resolve, reject0) => {
                ${removeFileWhenDelete}
            });
        }
    };
    return self;
}