
/************************************
** DATABASE ADAPTER
** 
*************************************/

exports = module.exports = (tbl) => {
    return {
        uuid: () => {
            return "123123";
        },
        find: ({
            where,
            sortBy,
            page = 1,
            recordsPerPage = 20
        }) => {
            return new Promise((resolve, reject) => {
                if (where) return resolve(where);
                reject('error');
            });
        },
        get: (where) => {
            return new Promise((resolve, reject) => {
                if (where) return resolve(where);
                reject('error');
            });
        },
        insert: (obj) => {
            return new Promise((resolve, reject) => {
                if (obj) return resolve(obj);
                reject('error');
            });
        },
        updates: (obj, where, fcDone) => {
            return new Promise((resolve, reject) => {
                if (obj) return resolve(obj);
                reject('error');
            });
        },
        update: (obj) => {
            return new Promise((resolve, reject) => {
                if (obj) return resolve(obj);
                reject('error');
            });
        },
        delete: (id) => {
            return new Promise((resolve, reject) => {
                if (id) return resolve(id);
                reject('error');
            });
        }
    }
}