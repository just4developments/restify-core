let fs = require('fs');
let path = require('path');
let _ = require('lodash');

module.exports = (tbl, fieldsKeyType, fieldsType) => {
    let self = this;
    this.find = (fieldsKeyType, fieldsType) => {
        return `server.get('/${tbl}', utils.jsonHandler(), (req, res, next) => {
    let where = {};
    return ${tbl}Service.find({where: where}).then((rs) => {
        res.send(rs);
    }).catch(next);
});`;
    };
    this.get = (fieldsKeyType, fieldsType) => {
        return `server.get('/${tbl}/:${fieldsKeyType.fieldName}', utils.jsonHandler(), (req, res, next) => {
    return ${tbl}Service.get(${fieldsKeyType.sign}req.params.${fieldsKeyType.fieldName}).then((rs) => {
        res.send(rs);
    }).catch(next);
});`
    }
    this.post = (fieldsKeyType, fieldsType) => {
        let assignIValue = new MyArray();
        let jsonBodyParser = 'utils.jsonHandler()';
        let bodyFileParser = new MyArray();
        assignIValue.push(fieldsKeyType.assignInController);
        for(var i in fieldsType){
            if(fieldsType[i].name !== 'Key'){
                assignIValue.push(fieldsType[i].assignInController);
                if(fieldsType[i].declareMiddleInController){
                    bodyFileParser.push(fieldsType[i].declareMiddleInController);
                }
            }
        }
        if(bodyFileParser.length > 0){
            
            jsonBodyParser = `utils.fileUploadHandler({
    ${bodyFileParser.join(',\n\t')}
})`;
        }        
        assignIValue = assignIValue.join('\n\t');
        return `server.post('/${tbl}', ${jsonBodyParser}, (req, res, next) => {
    let body = {};
    ${assignIValue}
    ${tbl}Service.insert(body).then((rs) => {
        res.send(rs);
    }).catch(next);
})`;
    }
    this.put = (fieldsKeyType, fieldsType) => {
        let assignUValue = new MyArray();
        let jsonBodyParser = 'utils.jsonHandler()';
        let bodyFileParser = new MyArray();        
        for(var i in fieldsType){
            if(fieldsType[i].name !== 'Key'){
                if(fieldsType[i].declareMiddleInController){
                    bodyFileParser.push(fieldsType[i].declareMiddleInController);
                }
            }
        }
        assignUValue.push(fieldsKeyType.assignUpController);
        for(var i in fieldsType){
            if(fieldsType[i].name !== 'Key'){
                assignUValue.push(fieldsType[i].assignUpController);
            }
        }
        if(bodyFileParser.length > 0){
            jsonBodyParser = `utils.fileUploadHandler({
    ${bodyFileParser.join(',\n\t')}
})`;
        }                
        assignUValue = assignUValue.join('\n\t');
        return `server.put('/${tbl}/:${fieldsKeyType.fieldName}', ${jsonBodyParser}, (req, res, next) => {
    let body = {};
    ${assignUValue}
    ${tbl}Service.update(body).then((rs) => {
        res.send(rs);
    }).catch(next);
})`;
    }
    this.delete = (fieldsKeyType, fieldsType) => {
        return `server.del('/${tbl}/:${fieldsKeyType.fieldName}', utils.jsonHandler(), (req, res, next) => {
    ${tbl}Service.delete(${fieldsKeyType.sign}req.params.${fieldsKeyType.fieldName}).then((rs) => {
        res.send(rs);
    }).catch(next);
})`;
    }
    this.writeTo = (outdir) => {
        let genContent = new MyArray();    
        genContent.push(self.find(fieldsKeyType, fieldsType));
        genContent.push(self.get(fieldsKeyType, fieldsType));
        genContent.push(self.post(fieldsKeyType, fieldsType));
        genContent.push(self.put(fieldsKeyType, fieldsType));
        genContent.push(self.delete(fieldsKeyType, fieldsType));
        let fcontroller = path.join(__dirname, '..', '..', outdir, 'controller', `${tbl}.controller.js`);
        try {
            fs.statSync(fcontroller);
            console.warn(`#WARN\t${fcontroller} is existed`);
        } catch (e) {
            let cnt = new String(fs.readFileSync(path.join(__dirname, '[name].controller.js')));
            cnt = cnt
                .replace(/\$\{tbl\}/g, tbl)
                .replace(/\$\{GEN_CONTENT\}/g, genContent.join('\n\n'))
                .replace(/\$\{tblDeco\}/g, tbl.toUpperCase().split('').join('-'))
                .replace(/\$\{createdDate\}/g, new Date().toLocaleString());
            fs.writeFileSync(fcontroller, cnt);
        }
    }
    return this;
}