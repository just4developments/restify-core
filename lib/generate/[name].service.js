const DB = require('../db');

/************************************
** SERVICE:      ${tbl}Controller
** AUTHOR:       Unknown
** CREATED DATE: ${createdDate}
*************************************/

module.exports = (tbl) => {
    let db = DB(tbl);
    let self = {
        validate: (obj, action) => {
            switch (action) {
                case 0: // For inserting

                    break;
                case 1: // For updating
                    break;
            }
            return obj;
        },
        find: (fil) => {
            return db.find(fil);
        },

        get: (${key}) => {
            return db.get({
                ${key}: ${key}
            });
        },

        insert: (obj) => {
            return new Promise((resolve, reject) => {
                try {
                    obj = self.validate(obj, 0);
                    db.insert(obj).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        },

        update: (obj) => {
            return new Promise((resolve, reject) => {
                try {
                    self.validate(obj, 0);
                    db.update(obj, {
                        where: {
                            ${key}: obj.${key}
                        }
                    }).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        },

        delete: (${key}) => {
            return db.delete(${key});
        }
    };
    return self;
}