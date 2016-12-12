let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.validate = (fieldsKeyType, fieldsType) => {
        let ivalidation = new MyArray();
        let uvalidation = new MyArray();
        let gvalidation = new MyArray();
        let dvalidation = new MyArray();
        let fvalidation = new MyArray();
        ivalidation.push(fieldsKeyType.validateInService ? fieldsKeyType.validateInService('item') : null);
        uvalidation.push(fieldsKeyType.validateUpService ? fieldsKeyType.validateUpService('item') : null);
        gvalidation.push(fieldsKeyType.validateGeService ? fieldsKeyType.validateGeService('item') : null);
        dvalidation.push(fieldsKeyType.validateDeService ? fieldsKeyType.validateDeService('item') : null);
        fvalidation.push(fieldsKeyType.validateFiService ? fieldsKeyType.validateFiService('item') : null);
        for(var i in fieldsType){
            if(fieldsType[i].name !== 'Key'){
                ivalidation.push(fieldsType[i].validateInService ? fieldsType[i].validateInService('item') : null);
                uvalidation.push(fieldsType[i].validateUpService ? fieldsType[i].validateUpService('item') : null);
                gvalidation.push(fieldsType[i].validateGeService ? fieldsType[i].validateGeService('item') : null);
                dvalidation.push(fieldsType[i].validateDeService ? fieldsType[i].validateDeService('item') : null);
                fvalidation.push(fieldsType[i].validateFiService ? fieldsType[i].validateFiService('item') : null);
            }
        }
        return `validate: (item, action) => {
        let msg;            
        switch (action) {
            case exports.VALIDATE.INSERT:
                ${ivalidation.join('\n\t\t\t\t')}
                break;
            case exports.VALIDATE.UPDATE:
                ${uvalidation.join('\n\t\t\t\t')}
                break;
            case exports.VALIDATE.GET:
                ${gvalidation.join('\n\t\t\t\t')}
                break;
            case exports.VALIDATE.DELETE:
                ${dvalidation.join('\n\t\t\t\t')}
                break;
            case exports.VALIDATE.FIND:
                ${fvalidation.join('\n\t\t\t\t')}
                break;
        }
        return item;
    },`;
    };
    this.find = () => {
        return `find: (fil={}) => {
        return new Promise((resolve, reject) => {
            try{
                fil = exports.validate(fil, exports.VALIDATE.FIND);
                db.open(exports.COLLECTION).then((db) => {
                    db.find(fil).then(resolve).catch(reject); 
                }).catch(reject);
            }catch(e){
                return reject(e);
            }             
        });
    },`;
    };
    this.get = (fieldsKeyType) => {
        return `get: (${fieldsKeyType.fieldName}) => {
        return new Promise((resolve, reject) => {
            try{
                ${fieldsKeyType.fieldName} = exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.GET);
                db.open(exports.COLLECTION).then((db) => {
                    db.get(${fieldsKeyType.fieldName}).then(resolve).catch(reject);; 
                }).catch(reject);
            }catch(e){
                return reject(e);
            }   
        });
    },`;
    }
    this.post = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        for(var i in fieldsType){
            if(fieldsType[i].name === 'File'){
                deleteFiles.push(`utils.deleteFile(utils.getAbsoluteUpload(item.${fieldsType[i].fieldName}, path.join(__dirname, '..', '..', '${fieldsType[i].config.uploadDir.split('/').join("', '")}')), ${Native.toString(fieldsType[i].config.resize)});`);                
            }
        }
        deleteFiles = deleteFiles.join('\n\t\t\t\t');
        if(deleteFiles.length > 0)
            return `insert: (item) => {            
        return new Promise((resolve, reject) => {
            let errorHandle = (e) => {
                ${deleteFiles}
                reject(e);
            };
            try {
                item = exports.validate(item, exports.VALIDATE.INSERT);
                db.open(exports.COLLECTION).then((db) => {
                    db.insert(item).then(resolve).catch(errorHandle);
                }).catch(errorHandle);
            } catch (e) {
                errorHandle(e);
            }
        });
    },`;
        return `insert: (item) => {
        return new Promise((resolve, reject) => {
            try {
                item = exports.validate(item, exports.VALIDATE.INSERT);
                db.open(exports.COLLECTION).then((db) => {
                    db.insert(item).then(resolve).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },`;
    }
    this.put = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        let deleteOldFiles = [];
        for(var i in fieldsType){
            if(fieldsType[i].name === 'File'){
                deleteFiles.push(`utils.deleteFile(utils.getAbsoluteUpload(item.${fieldsType[i].fieldName}, path.join(__dirname, '..', '..', '${fieldsType[i].config.uploadDir.split('/').join("', '")}')), ${Native.toString(fieldsType[i].config.resize)});`);
                deleteOldFiles.push(`utils.deleteFile(utils.getAbsoluteUpload(oldItem.${fieldsType[i].fieldName}, path.join(__dirname, '..', '..', '${fieldsType[i].config.uploadDir.split('/').join("', '")}')), ${global.Native.toString(fieldsType[i].config.resize)});`);           
            }
        }
        deleteFiles = deleteFiles.join('\n\t\t\t\t');
        deleteOldFiles = deleteOldFiles.join('\n\t\t\t\t\t\t\t');
        if(deleteFiles.length > 0)
            return `update: (item) => {
        return new Promise((resolve, reject) => {
            let errorHandle = (e) => {
                ${deleteFiles}
                reject(e);
            };
            try {
                exports.validate(item, exports.VALIDATE.UPDATE);
                db.open(exports.COLLECTION).then((db) => {
                    db.get(item.${fieldsKeyType.fieldName}, db.FAIL).then((oldItem) => {
                        db.update(item).then((rs) => {                            
                            ${deleteOldFiles}
                            resolve(rs);
                        }).catch(errorHandle);
                    }).catch(errorHandle);
                }).catch(errorHandle);
            } catch (e) {
                errorHandle(e);
            }
        });
    },`;
        return `update: (item) => {
        return new Promise((resolve, reject) => {
            try {
                exports.validate(item, exports.VALIDATE.UPDATE);
                db.open(exports.COLLECTION).then((db) => {
                    db.get(item.${fieldsKeyType.fieldName}, db.FAIL).then((item) => {
                        db.update(item).then(resolve).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    },`;
    }
    this.delete = (fieldsKeyType, fieldsType) => {
        let deleteFiles = [];
        for(var i in fieldsType){
            if(fieldsType[i].name === 'File'){
                deleteFiles.push(`utils.deleteFile(utils.getAbsoluteUpload(item.${fieldsType[i].fieldName}, path.join(__dirname, '..', '..', '${fieldsType[i].config.uploadDir.split('/').join("', '")}')), ${Native.toString(fieldsType[i].config.resize)});`);           
            }
        }
        deleteFiles = deleteFiles.join('\n\t\t\t\t\t\t\t');
        if(deleteFiles.length > 0)
            return `delete: (${fieldsKeyType.fieldName}) => {
        return new Promise((resolve, reject) => {
            try {
                exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.DELETE);
                db.open(exports.COLLECTION).then((db) => {
                    db.get(${fieldsKeyType.fieldName}, db.FAIL).then((item) => {                    
                        db.delete(${fieldsKeyType.fieldName}).then((rs) => {
                            ${deleteFiles}
                            resolve(rs);
                        }).catch(reject);                        
                    }).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    }`;
        return `delete: (${fieldsKeyType.fieldName}) => {
        return new Promise((resolve, reject) => {
            try {
                exports.validate(item, exports.VALIDATE.DELETE);
                db.open(exports.COLLECTION).then((db) => {
                    db.get(${fieldsKeyType.fieldName}, db.FAIL).then((item) => {                    
                        db.delete(${fieldsKeyType.fieldName}).then(resolve).catch(reject);                        
                    }).catch(reject);
                }).catch(reject);
            } catch (e) {
                reject(e);
            }
        });
    }`;
    }
    this.writeTo = (outdir) => {
        let genContent = new MyArray();
        genContent.push(self.validate(fieldsKeyType, fieldsType));
        genContent.push(self.find(fieldsType, fieldsType));
        genContent.push(self.get(fieldsKeyType, fieldsType));
        genContent.push(self.post(fieldsKeyType, fieldsType));
        genContent.push(self.put(fieldsKeyType, fieldsType));
        genContent.push(self.delete(fieldsKeyType, fieldsType));
        let fservice = path.join(__dirname, '..', '..', outdir, 'service', `${tbl}.service.js`);
        // try {
        //     fs.statSync(fservice);
        //     console.warn(`#WARN\t${fservice} is existed`);
        // } catch (e) {
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].service.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{GEN_CONTENT\}/g, genContent.join('\n\n\t'))
                .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
                .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
            let beautify = require('js-beautify').js_beautify;
            cnt = beautify(cnt.toString('binary'), { "indent_size": 1, "indent_char": "\t"});
            fs.writeFileSync(fservice, cnt);
        // }
    }
    return this;
}