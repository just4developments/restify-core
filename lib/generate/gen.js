const fs = require('fs');
const path = require('path');

let jsonStringifyClass = (obj, c) => {
    var rs = [];
    rs.push(`{`);
    let o = [];
    for(var i in obj){
        o.push(`${c}${i}: ${obj[i].prototype.constructor.name}`);
    }
    rs.push(o.join(', '));
    rs.push(`}`);
    return rs.join(' ');
}
global.Stringable = class Stringable extends String {};
global.Stringable.prototype.nullable = true;
global.Numberable = class Numberable extends Number{};
global.Numberable.prototype.nullable = true;
global.Dateable = class Dateable extends Date {};
global.Dateable.prototype.nullable = true;
global.Objectable = class Objectable extends Object {};
global.Objectable.prototype.nullable = true;
global.Arrayable = class Arrayable extends Array {};
global.Arrayable.prototype.nullable = true;
global.Key = (type, isManual) => {
    let Key = class Key {};
    Key.prototype.type = type;
    Key.prototype.isManual = isManual;
    return Key;
}
global.FileUpload = (config) => {
        let FileUpload = class FileUpload {};
        if (!config) throw 'Not config upload path yet';
        FileUpload.prototype.returnPath = config.returnPath;
        delete config.returnPath;
        FileUpload.prototype.config = `utils.fileUploadHandler(${Object.keys(config).length === 1 ? `'${config.uploadDir}'` : JSON.stringify(config, null, '\t')}),`;
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
    let ivalidation = [];
    let uvalidation = [];
    let hasUpload = '';
    for (var colName in col) {
        if (col[colName].prototype.constructor.name === 'Key') {
            key = colName;
            if (['Number', 'Numberable'].indexOf(col[colName].prototype.type.prototype.constructor.name) !== -1) signKey = '+';
            if (col[colName].prototype.isManual) assignIValue.push(`var body = { ${key}: db.uuid() };`);
            else assignIValue.push(`var body = {};`);
        }else if(['Array', 'Arrayable', 'Object', 'Objectable'].indexOf(col[colName].prototype.constructor.name) != -1) {
            let typeName = col[colName].prototype.constructor.name;
            typeName === 'Arrayable' ? 'Array' : ('Objectable' ? 'Object' : typeName);
            assignIValue.push(`if(req.body.${colName} && req.body.${colName} instanceof ${typeName}) body.${colName} = req.body.${colName};`);
            assignUValue.push(`if(req.body.${colName} && req.body.${colName} instanceof ${typeName}) body.${colName} = req.body.${colName};`);       
        } else if(col[colName].prototype.constructor.name === 'FileUpload') {
            hasUpload = col[colName].prototype.config;
            assignIValue.push(`if(req.files.${colName}) body.${colName} = utils.getPathUpload(req.files.${colName}, '${col[colName].prototype.returnPath}');`);
            assignUValue.push(`if(req.files.${colName}) body.${colName} = utils.getPathUpload(req.files.${colName}, '${col[colName].prototype.returnPath}');`);
        }else{
            assignIValue.push(`if(req.body.${colName}) body.${colName} = ${(['Number', 'Numberable'].indexOf(col[colName].prototype.constructor.name) !== -1) ? '+' : ''}req.body.${colName};`);
            assignUValue.push(`if(req.body.${colName}) body.${colName} = ${(['Number', 'Numberable'].indexOf(col[colName].prototype.constructor.name) !== -1) ? '+' : ''}req.body.${colName};`);
        }
        if(!col[colName].prototype.nullable){
            if(col[colName].prototype.constructor.name !== 'Key' || (col[colName].prototype.constructor.name === 'Key' && col[colName].prototype.isManual)){
                ivalidation.push(`if(!utils.has(obj.${colName})) throw '${colName} is required!';`);
            }
            uvalidation.push(`if(!utils.has(obj.${colName})) throw '${colName} is required!';`);
        }
    }
    // Controller
    let fcontroller = path.join(config.outdir, 'controller', `${tbl}.controller.js`);
    try {
        fs.statSync(fcontroller);
        console.warn(`#WARN\t${fcontroller} is existed`);
    } catch (e) {
        let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].controller.js')));
        cnt = cnt
            .replace(/\$\{tbl\}/g, tbl)
            .replace(/\$\{signKey\}/g, signKey)
            .replace(/\$\{key\}/g, key)
            .replace(/\$\{hasUpload\}/g, hasUpload)
            .replace(/\$\{assignIValue\}/g, assignIValue.join('\n\t'))
            .replace(/\$\{assignUValue\}/g, assignUValue.join('\n\t'))
            .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
            .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
        fs.writeFileSync(fcontroller, cnt);
    }
    // Service
    let fservice = path.join(config.outdir, 'service', `${tbl}.service.js`);
    try {
        fs.statSync(fservice);
        console.warn(`#WARN\t${fservice} is existed`);
    } catch (e) {
        let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].service.js')));
        cnt = cnt
            .replace(/\$\{tbl\}/g, tbl)
            .replace(/\$\{key\}/g, key)
            .replace(/\$\{ivalidation\}/g, ivalidation.join('\n\t\t\t\t\t'))
            .replace(/\$\{uvalidation\}/g, uvalidation.join('\n\t\t\t\t\t'))
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