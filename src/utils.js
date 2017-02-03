const _ = require('lodash');

const db = require('./db');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {
    authHandler() {
        return (req, res, next) => {
            if(!req.headers.token) return next(new restify.ProxyAuthenticationRequiredError());                    
            const [project_id, account_id, token] = req.headers.token.split('-');        
            req.auth = {
                projectId: db.uuid(project_id),
                accountId: db.uuid(account_id),
                token: db.uuid(token)
            };
            next();
        };
    },
    auth(pathCode, ...actions){
        return (req, res, next) => {
            if(!req.headers.token) return next(new restify.ProxyAuthenticationRequiredError());
            var Request = unirest
                .head(`${global.appconfig.auth.url}/Authoriz`)
                .headers({
                    token: req.headers.token,
                    path: pathCode,
                    actions: actions.join(',')
                }).end((resp) => {
                    switch (resp.code) {
                        case 200:
                            const token = req.headers.token.split('-');
                            const actions = resp.headers.actions.split(',');
                            req.auth = {
                                actions,
                                project_id: db.uuid(token[0]),
                                account_id: db.uuid(token[1]),
                                token: db.uuid(token[2])
                            };
                            return next();                    
                        default:
                            return next(new restify.ForbiddenError());
                    }
                });
        };
    },
    toUnsign(alias)
    {
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