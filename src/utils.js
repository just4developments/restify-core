const _ = require('lodash');
const unirest = require('unirest');
const restify = require('restify');

let db = require('./db');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {
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
                                projectId: db.uuid(token[0]),
                                accountId: db.uuid(token[1]),
                                token: db.uuid(token[2])
                            };
                            return next();                    
                        case 401: 
                            return next(new restify.UnauthorizedError());
                        case 403: 
                            return next(new restify.ForbiddenError());
                        case 407: 
                            return next(new restify.ProxyAuthenticationRequiredError());
                        default:
                            return next(new restify.InternalError());
                    }
                });
        };
    }
});