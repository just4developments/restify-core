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
        return new Promise(async (resolve, reject) => {
            try {
                fil = exports.validate(fil, exports.VALIDATE.FIND);

                let dbo = await db.open(exports.COLLECTION);
                let rs = await dbo.find(fil);

                resolve(rs); 
            } catch(err) {
                reject(err);
            }             
        });
    },`;
    };
    this.get = (fieldsKeyType) => {
        return `get: (${fieldsKeyType.fieldName}) => {
        return new Promise(async (resolve, reject) => {
            try {
                ${fieldsKeyType.fieldName} = exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.GET);

                let dbo = await db.open(exports.COLLECTION);
                let rs = await dbo.get(${fieldsKeyType.fieldName});

                resolve(rs); 
            } catch(err) {
                reject(err);
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
        return `insert: (item) => {            
                    return new Promise(async (resolve, reject) => {
                        try {
                            item = exports.validate(item, exports.VALIDATE.INSERT);

                            let dbo = await db.open(exports.COLLECTION);
                            let rs = await dbo.insert(item);

                            resolve(rs);
                        } catch (err) {
                            ${deleteFiles}

                            reject(err);
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
                        return new Promise(async (resolve, reject) => {
                            try {
                                exports.validate(item, exports.VALIDATE.UPDATE);

                                let dbo = await db.open(exports.COLLECTION);
                                let oldItem = await dbo.get(item.${fieldsKeyType.fieldName}, dbo.FAIL);
                                let rs = await dbo.update(item);                                                            
                                ${deleteOldFiles}

                                resolve(rs);
                            } catch (err) {
                                ${deleteFiles}

                                reject(err);
                            }
                        });
                    },`;
        return `update: (item) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            exports.validate(item, exports.VALIDATE.UPDATE);

                            let dbo = await db.open(exports.COLLECTION);                            
                            let rs = await dbo.update(item);

                            resolve(rs);
                        } catch (err) {
                            reject(err);
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
                        return new Promise(async (resolve, reject) => {
                            try {
                                exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.DELETE);

                                let dbo = await db.open(exports.COLLECTION);          
                                let item = await dbo.get(${fieldsKeyType.fieldName}, dbo.FAIL);                                      
                                let rs = await dbo.delete(${fieldsKeyType.fieldName});                            
                                ${deleteFiles}

                                resolve(rs);
                            } catch (err) {
                                reject(err);
                            }
                        });
                    }`;
        return `delete: (${fieldsKeyType.fieldName}) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            exports.validate(${fieldsKeyType.fieldName}, exports.VALIDATE.DELETE);

                            let dbo = await db.open(exports.COLLECTION);                                                
                            let rs = await dbo.delete(${fieldsKeyType.fieldName});
                            
                            resolve(rs);
                        } catch (err) {
                            reject(err);
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
        try {
            fs.statSync(fservice);
            console.warn(`#WARN\t${fservice} is existed`);
        } catch (e) {
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].service.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{GEN_CONTENT\}/g, genContent.join('\n\n\t'))
                .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
                .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
            let beautify = require('js-beautify').js_beautify;
            cnt = beautify(cnt.toString('binary'), { "indent_size": 1, "indent_char": "\t"});
            fs.writeFileSync(fservice, cnt);
        }
    }
    return this;
}