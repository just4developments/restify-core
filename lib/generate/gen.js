const fs = require('fs');
const path = require('path');

let genHelper = require('./gen.helper.js');
let stringifyNative = (obj, c) => {
   return global.Native.toString(JSON.stringify(obj, null, c));
};
global.Stringable = class Stringable extends String {};
global.Stringable.prototype.nullable = true;
global.Numberable = class Numberable extends Number{};
global.Numberable.prototype.nullable = true;
global.Dateable = class Dateable extends Date {};
global.Dateable.prototype.nullable = true;
global.Dateignore = class Dateignore extends Date {};
global.Dateignore.prototype.ignore = true;
global.Objectable = class Objectable extends Object {};
global.Objectable.prototype.nullable = true;
global.Arrayable = class Arrayable extends Array {};
global.Arrayable.prototype.nullable = true;
global.Native = (value) => {
    return `Native(${value})`;
}
global.Native.toString = (vl) => {
    return vl.replace(/"?Native\(([^\)]+)\)"?/g, '$1');
}
global.Key = (type, isManual) => {
    let Key = class Key {};
    Key.prototype.type = type;
    Key.prototype.isManual = isManual;
    return Key;
}
global.FileUpload = (config) => {
        let FileUpload = class FileUpload {};
        if (!config) throw 'Not config upload path yet';
        FileUpload.prototype._config = config;
        FileUpload.prototype.config = `utils.fileUploadHandler(${Object.keys(config).length === 1 ? `'${config.uploadDir}'` : stringifyNative(config, '\t')}), `;
    return FileUpload;
}

// server.use(restify.bodyParser({
//     maxBodySize: 0,
//     mapParams: true,
//     mapFiles: true,
//     overrideParams: false,
//     multipartHandler: function (part) {
//         part.on('data', function (data) { /* do something with the multipart data */ });
//     },
//     multipartFileHandler: function (part) {
//         part.on('data', function (data) { /* do something with the multipart file data */ });
//     },
//     keepExtensions: true,
//     uploadDir: path.join(__dirname),
//     multiples: true,
//     hash: 'sha1'
// }));

const config = require('./initial.js');

let generate = (tbl, col) => {
    let key;
    let signKey = '';
    let assignIValue = [];
    let assignUValue = [];
    let removeFileWhenUpdate = [];
    let removeFileWhenDelete = [];
    let removeFileWhenIUError = 'reject(e);';
    let ivalidation = [];
    let uvalidation = [];
    let jsonBodyParser = `utils.jsonHandler(), `;
    for (var colName in col) {
        if (col[colName].prototype.constructor.name === 'Key') {
            key = colName;
            if (['Number', 'Numberable'].indexOf(col[colName].prototype.type.prototype.constructor.name) !== -1) signKey = '+';
            if (col[colName].prototype.isManual) assignIValue.push(`var body = { ${key}: db.uuid() };`);
            else assignIValue.push(`var body = {};`);
        }else if(['Array', 'Arrayable', 'Object', 'Objectable'].indexOf(col[colName].prototype.constructor.name) != -1) {
            let typeName = col[colName].prototype.constructor.name;
            typeName = typeName === 'Arrayable' ? 'Array' : (typeName === 'Objectable' ? 'Object' : typeName);
            assignIValue.push(`if(req.body.${colName} && req.body.${colName} instanceof ${typeName}) body.${colName} = req.body.${colName};`);
            assignUValue.push(`if(req.body.${colName} && req.body.${colName} instanceof ${typeName}) body.${colName} = req.body.${colName};`);       
        } else if(col[colName].prototype.constructor.name === 'FileUpload') {
            jsonBodyParser = col[colName].prototype.config;            
            assignIValue.push(`if(req.file.${colName}) body.${colName} = req.file.${colName};`);
            assignUValue.push(`if(req.file.${colName}) body.${colName} = req.file.${colName};`);
            removeFileWhenIUError = 
                `utils.deleteFile(utils.getAbsoluteUpload(obj.${colName}, path.join(__dirname, '..', '..', '${col[colName].prototype._config.uploadDir.split('/').join("', '")}')), ${global.Native.toString(col[colName].prototype._config.resize)});
                reject(e);`;            
            removeFileWhenUpdate.push(
                `db.open(exports.COLLECTION).then((db) => {
                    db.get(obj.${key}, db.FAIL).then((item) => {
                        let old${colName} = item.${colName};
                        db.update(obj, db.DONE).then((rs) => {                            
                            utils.deleteFile(utils.getAbsoluteUpload(old${colName}, path.join(__dirname, '..', '..', '${col[colName].prototype._config.uploadDir.split('/').join("', '")}')), ${global.Native.toString(col[colName].prototype._config.resize)});
                            resolve(rs);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);`);
            removeFileWhenDelete.push(
            `db.open(exports.COLLECTION).then((db) => {
                db.get(${key}, db.FAIL).then((item) => {
                    let old${colName} = item.${colName};                        
                    db.delete(${key}, db.DONE).then((rs) => {
                        utils.deleteFile(utils.getAbsoluteUpload(old${colName}, path.join(__dirname, '..', '..', '${col[colName].prototype._config.uploadDir.split('/').join("', '")}')), ${global.Native.toString(col[colName].prototype._config.resize)});
                        resolve(rs);
                    }).catch(reject);                        
                }).catch(reject);
            }).catch(reject);`);
        }else{
            if(col[colName].prototype.ignore && ['Dateignore'].indexOf(col[colName].prototype.constructor.name) != -1){
                assignIValue.push(`body.${colName} = new Date();`);
                assignUValue.push(`body.${colName} = new Date();`);
            }else{
                assignIValue.push(`if(req.body.${colName}) body.${colName} = ${(['Number', 'Numberable'].indexOf(col[colName].prototype.constructor.name) !== -1) ? '+' : ''}req.body.${colName};`);
                assignUValue.push(`if(req.body.${colName}) body.${colName} = ${(['Number', 'Numberable'].indexOf(col[colName].prototype.constructor.name) !== -1) ? '+' : ''}req.body.${colName};`);
            }
        }
        if(!col[colName].prototype.nullable && !col[colName].prototype.ignore){
            if(col[colName].prototype.constructor.name !== 'Key' || (col[colName].prototype.constructor.name === 'Key' && col[colName].prototype.isManual)){
                ivalidation.push(`if(!utils.has(obj.${colName})) throw new restify.BadRequestError('${colName} is required!');`);
            }
            uvalidation.push(`if(!utils.has(obj.${colName})) throw new restify.BadRequestError('${colName} is required!');`);
        }        
    }
    if(removeFileWhenUpdate.length === 0){
        removeFileWhenUpdate.push(
                `db.open(exports.COLLECTION).then((db) => {
                    db.update(obj, db.DONE).then(resolve).catch(reject);
                }).catch(reject)`);
    }
    if(removeFileWhenDelete.length === 0){
        removeFileWhenDelete.push(
            `db.open(exports.COLLECTION).then((db) => {
                db.delete(${key}, db.DONE).then(resolve).catch(reject);
            }).catch(reject)`);
    }
    // Controller
    genHelper.export(path.join(__dirname, '[name].controller.js'), {
        tbl: tbl,
        signKey: signKey,
        key: key,
        jsonBodyParser: jsonBodyParser,
        assignIValue: assignIValue.join('\n\t'),
        assignUValue: assignUValue.join('\n\t'),
        tblDeco: tbl.toUpperCase().split('').join('-'),
        createdDate: new Date().toLocaleString()
    }, path.join(config.outdir, 'controller', `${tbl}.controller.js`));
    // Service
    genHelper.export(path.join(__dirname, '[name].service.js'), {
        tbl: tbl,
        key: key,
        ivalidation: ivalidation.join('\n\t\t\t\t\t'),
        uvalidation: uvalidation.join('\n\t\t\t\t\t'),
        removeFileWhenUpdate: removeFileWhenUpdate.join('\n'),
        removeFileWhenDelete: removeFileWhenDelete.join('\n'),
        removeFileWhenIUError: removeFileWhenIUError,
        tblDeco: tbl.toUpperCase().split('').join('-'),
        createdDate: new Date().toLocaleString()
    }, path.join(config.outdir, 'service', `${tbl}.service.js`));
}

for (var tbl in config.tables) {
    generate(tbl, config.tables[tbl]);
}

// server.post('/hello', restify.bodyParser({
//     mapFiles: true,
//     keepExtensions: true,
//     uploadDir: path.join(__dirname),
//     multiples: true
// }), (req, res, next) => {
//     console.log(req.params);
//     res.send('uploaded', req.params);
// })