let _ = require('lodash');

let db = require('./db');
/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {
    auth(req, res, next){
        if(!req.headers.token) return next(new restify.ProxyAuthenticationRequiredError());                    
        const [projectId, accountId, token] = req.headers.token.split('-');        
        req.auth = {
            projectId: db.uuid(projectId),
            accountId: db.uuid(accountId),
            token: db.uuid(token)
        };
        next();
    }
});