const DB = require('../db');
const utils = require('../utils');

/************************************
** SERVICE:      productController
** AUTHOR:       Unknown
** CREATED DATE: 11/5/2016, 9:17:02 PM
*************************************/

module.exports = (tbl) => {
    let db = DB(tbl);
    let self = {
        validate: (obj, action) => {
            switch (action) {
                case 0: // For inserting
                    if(!utils.has(obj.name)) throw 'name is required!';
					if(!utils.has(obj.des)) throw 'des is required!';
					if(!utils.has(obj.category_id)) throw 'category_id is required!';
					if(!utils.has(obj.createdDate)) throw 'createdDate is required!';
					if(!utils.has(obj.images)) throw 'images is required!';
					if(!utils.has(obj.details)) throw 'details is required!';
                    break;
                case 1: // For updating
                    if(!utils.has(obj._id)) throw '_id is required!';
					if(!utils.has(obj.name)) throw 'name is required!';
					if(!utils.has(obj.des)) throw 'des is required!';
					if(!utils.has(obj.category_id)) throw 'category_id is required!';
					if(!utils.has(obj.createdDate)) throw 'createdDate is required!';
					if(!utils.has(obj.images)) throw 'images is required!';
					if(!utils.has(obj.details)) throw 'details is required!';
                    break;
            }
            return obj;
        },
        find: (fil) => {
            return db.find(fil);
        },

        get: (_id) => {
            return db.get({
                _id: _id
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
                            _id: obj._id
                        }
                    }).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        },

        delete: (_id) => {
            return db.delete(_id);
        }
    };
    return self;
}