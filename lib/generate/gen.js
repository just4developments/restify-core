let _ = require('lodash');

<<<<<<< HEAD
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
=======
require('./gen.declare');
let config = require('./initial');
let genController = require('./gen.controller');
let genService = require('./gen.service');
let genHttp = require('./gen.http');
>>>>>>> c71f8232167a28a0269d010c99f50789e772a61e

_.forOwn(config.tables, (props, tblName) => {
    let fieldsType = new MyArray();
    let fieldsKeyType;
    _.forOwn(props, (fieldType, fieldName) => {
        if(!fieldType.prototype){
            fieldType = Reflect.apply(fieldType, undefined, []);
        }
<<<<<<< HEAD
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
    let fservice = path.join(__dirname, '..', '..', config.outdir, 'service', `${tbl}.service.js`);
    try {
        fs.statSync(fservice);
        console.warn(`#WARN\t${fservice} is existed`);
    } catch (e) {
        let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].service.js')));
        cnt = cnt
            .replace(/\$\{tbl\}/g, tbl)
            .replace(/\$\{key\}/g, key)
            .replace(/\$\{ivalidation\}/g, ivalidation.join('\n\t\t\t\t'))
            .replace(/\$\{uvalidation\}/g, uvalidation.join('\n\t\t\t\t'))
            .replace(/\$\{removeFileWhenUpdate\}/g, removeFileWhenUpdate.join('\n'))
            .replace(/\$\{removeFileWhenDelete\}/g, removeFileWhenDelete.join('\n'))
            .replace(/\$\{removeFileWhenIUError\}/g, removeFileWhenIUError)
            .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
            .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
        fs.writeFileSync(fservice, cnt);
    }
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
=======
        fieldType.gen(fieldName);
        fieldsType.push(fieldType);
        if(fieldType.name === 'Key'){
            fieldsKeyType = fieldType;
        }
    });
    genController(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genService(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genHttp(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
});
>>>>>>> c71f8232167a28a0269d010c99f50789e772a61e
