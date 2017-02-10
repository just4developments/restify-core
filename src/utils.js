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
    authHandler(isAutoCheckInCache=false) {
        return async (req, res, next) => {
            if(!req.headers.token && !req.headers.secret_key) return next(new restify.UnauthorizedError('Authen got problem'));
            if(req.headers.token) {
                const [project_id, account_id, token] = req.headers.token.split('-');        
                req.auth = {
                    projectId: db.uuid(project_id),
                    accountId: db.uuid(account_id),
                    secretToken: db.uuid(token)
                };
            }else {
                const accountService = require('./service/account.service');
                try {
                    const rawToken = await accountService.authBySecretKey(db.uuid(req.headers.secret_key));                
                    const [projectId, accountId, secretKey] = rawToken.split('-');        
                    req.auth = {
                        projectId: db.uuid(projectId),
                        accountId: db.uuid(accountId),
                        secretToken: db.uuid(secretKey)
                    };
                } catch(e){
                    return next(e);
                }
            }
            if(isAutoCheckInCache){
                const accountService = require('./service/account.service');
                const cacheService = require('./service/cached.service');
                const cached = cacheService.open();
                let user = await accountService.getCached(req.auth.secretToken, cached);
                await cached.close();
                if(!user) return next(new restify.UnauthorizedError('Session was expired'));
            }
            next();
        };
    },
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