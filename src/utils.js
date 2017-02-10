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
    }
});