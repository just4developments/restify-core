const fs = require('fs');
const path = require('path');

global.Key = (type, isManual) => {
    let Key = class Key {};
    Key.prototype.type = type;
    Key.prototype.isManual = isManual;
    return Key;
}
global.FileUpload = (config) => {
    let FileUpload = class FileUpload {};
    if(!config) throw 'Not config upload path yet';
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
    let hasUpload = '';
    for (var colName in col) {
        if (col[colName].prototype.constructor.name === 'Key') {
            key = colName;
            if (col[colName].prototype.type.prototype.constructor.name === 'Number') signKey = '+';
            if (col[colName].prototype.isManual) assignIValue.push(`var body = { ${key}: db.uuid() };`);
            else assignIValue.push(`var body = {};`);
        } else if(col[colName].prototype.constructor.name === 'FileUpload') {
            hasUpload = col[colName].prototype.config;
            assignIValue.push(`if(req.files.${colName}) body.${colName} = utils.getPathUpload(req.files.${colName}, '${col[colName].prototype.returnPath}');`);
            assignUValue.push(`if(req.files.${colName}) body.${colName} = utils.getPathUpload(req.files.${colName}, '${col[colName].prototype.returnPath}');`);
        }else{
            assignIValue.push(`if(req.body.${colName}) body.${colName} = ${col[colName].prototype.constructor.name === 'Number' ? '+' : ''}req.body.${colName};`);
            assignUValue.push(`if(req.body.${colName}) body.${colName} = ${col[colName].prototype.constructor.name === 'Number' ? '+' : ''}req.body.${colName};`);
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
            .replace(/\$\{hasUpload\}/g, hasUpload)
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