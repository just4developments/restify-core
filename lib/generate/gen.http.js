let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.writeTo = (outdir) => {
        let insertFields = new MyArray();
        let updateFields = new MyArray();
        let contentType = 'application/json';
        for(var i in fieldsType){
            if(fieldsType[i].name !== 'Key'){
                insertFields.push(fieldsType[i].inHttp);
                updateFields.push(fieldsType[i].upHttp);
            }else if(fieldsType[i].name === 'File'){
                contentType = 'multipart/form-data';
            }
        }
        insertFields = insertFields.join('\n\t\t');
        updateFields = updateFields.join('\n\t\t');
        let fhttp = path.join(__dirname, '..', '..', outdir, 'test', `${tbl}.http.txt`);
        try {
            fs.statSync(fhttp);
            console.warn(`#WARN\t${fhttp} is existed`);
        } catch (e) {
            let appconfig = require('../../src/appconfig')
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].http.txt')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{insertFields\}/g, insertFields)
                .replace(/\$\{updateFields\}/g, updateFields)
                .replace(/\$\{contentType\}/g, contentType)
                .replace(/\$\{port\}/g, appconfig ? appconfig.listen : 9000)
            fs.writeFileSync(fhttp, cnt);
        }   
    }    
    return this;
}