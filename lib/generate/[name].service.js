let restify = require('restify');
let path = require('path');

let db = require('../db');
let utils = require('../utils');

/************************************
** SERVICE:      ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

exports = module.exports = {
    COLLECTION: "${tbl}",
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
            db.open(exports.COLLECTION).then((db) => {
                db.find(fil).then(resolve).catch(reject); 
            }).catch(reject); 
        });
    },
    get: (${key}) => {
        return new Promise((resolve, reject) => {
            db.open(exports.COLLECTION).then((db) => {
                db.get(${key}).then(resolve).catch(reject);; 
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
                ${removeFileWhenIUError}
            }
        });
    },
    update: (obj) => {
        return new Promise((resolve, reject) => {
            try {
                exports.validate(obj, 1);
                ${removeFileWhenUpdate}
            } catch (e) {
                ${removeFileWhenIUError}
            }
        });
    },
    delete: (${key}) => {
        return new Promise((resolve, reject) => {
            ${removeFileWhenDelete}
        });
    }
}