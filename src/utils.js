let restify = require('restify');
let _ = require('lodash');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = _.extend(require('../lib/core/utils'), {
    validateJson: (data, schema) => {
        var Ajv = require('ajv');
        var ajv = new Ajv();
        var validate = ajv.compile(schema);
        var valid = validate(data);
        if (!valid) {
            throw new restify.BadRequestError(validate.errors.map((e) => {
                return e.message + '\n' + (Object.keys(e.params).length > 0 ? JSON.stringify(e.params, null, '\t') : '');
            }).join('\n'));
        };
    }
});
