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
        return (req, res, next) => {
            if(!req.headers.token) return next(new restify.ProxyAuthenticationRequiredError());
            const resp = await microService.checkAuthoriz({
                token: req.headers.token,
                path: pathCode,
                actions: actions.join(',')
            });
            if(resp.code !== 200) return next(new restify.ForbiddenError());
            const token = req.headers.token.split('-');
            req.auth = {
                projectId: db.uuid(token[0]),
                accountId: db.uuid(token[1]),
                token: db.uuid(token[2]),
                rawToken: req.headers.token
            };
            next();
        };
    }
});