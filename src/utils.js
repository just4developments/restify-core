const unirest = require('unirest');
const restify = require('restify');
const _ = require('lodash');

const db = require('./db');
const microService = require('./service/micro.service');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {    
    auth(pathCode, ...actions){
        return async (req, res, next) => {
            if(!req.headers.token && !req.headers.secret_key) return next(new restify.ProxyAuthenticationRequiredError());
            let headers = {                
                path: pathCode,
                actions: actions.join(',')
            };
            if(req.headers.token) headers.token = req.headers.token;
            else if(req.headers.secret_key) headers.secret_key = req.headers.secret_key;
            const resp = await microService.checkAuthoriz(headers);
            if(resp.code !== 200) return next(new restify.ForbiddenError());
            const token = resp.headers.token.split('-');
            req.auth = {
                projectId: db.uuid(token[0]),
                accountId: db.uuid(token[1]),
                token: db.uuid(token[2]),
                rawToken: resp.headers.token
            };
            next();
        };
    },
    toUnsign(alias) {
        let str = alias;
        str= str.toLowerCase(); 
        str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ  |ặ|ẳ|ẵ/g,"a"); 
        str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ  |ợ|ở|ỡ/g,"o"); 
        str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str= str.replace(/đ/g,"d"); 
        str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|$|_/g,"");
        /* tìm và thay thế các kí tự đặc biệt trong chuỗi sang kí tự - */
        str= str.replace(/-+-/g,""); //thay thế 2- thành 1-
        str= str.replace(/^\-+|\-+$/g,""); 
        return str;
    }
});