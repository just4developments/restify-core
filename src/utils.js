let _ = require('lodash');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {
    auth(req, res, next){
        if(!req.headers.token) return next(new restify.ProxyAuthenticationRequiredError());                    
        const [projectId, userId, token] = req.headers.token.split('-');        
        req.auth = {
            projectId,
            userId,
            token
        };
        next();
    }
});