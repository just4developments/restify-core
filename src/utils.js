let path = require('path');
let restify = require('restify');
let fs = require('fs');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

module.exports = {
    has: (params) => {
        return params !== undefined && params !== null;
    },
    jsonHandler: (config) => {
        return restify.bodyParser(config);
    },
    fileUploadHandler: (config) => {
        let defaultConfig = {
            maxBodySize: 0,
            mapFiles: true,
            mapParams: false,
            keepExtensions: true,
            multiples: false
                // multipartHandler: function (part) {
                //     part.on('data', function (data) { });
                // },
                // multipartFileHandler: function (part) {
                //     part.on('data', function (data) { });
                // }
        };
        if (config instanceof Object) {
            defaultConfig = Object.assign(defaultConfig, config);
            if (defaultConfig.uploadDir) defaultConfig.uploadDir = path.join(__dirname, '..', defaultConfig.uploadDir);
        } else {
            defaultConfig.uploadDir = path.join(__dirname, '..', config);
        }
        return restify.bodyParser(defaultConfig);
    },
    getAbsoluteUpload: (files) => {
        if (!files) return files;
        this.getPath = (f) => {
            return path.join(__dirname, '..', 'assets', f);
        };
        if (!(files instanceof Array)) {
            return this.getPath(files);
        }
        let rs = [];
        for (let f of files) {
            rs.push(this.getPath(f));
        }
        return rs;

    },
    deleteFile: (files) => {
        if (!files) return;
        this.remove = (f) => {
            try {
                fs.statSync(f);
                fs.unlinkSync(f);
            } catch (e) { /*File was removed before that*/ }
        };
        if (!(files instanceof Array)) {
            return this.remove(files);
        }
        for (var f of files) {
            this.remove(f);
        }
    },
    getPathUpload: (file, returnPath, multiples) => {
        if (file instanceof Array) {
            return file.map((f) => {
                return returnPath + path.basename(f.path)
            });
        }
        return returnPath + path.basename(file.path);
    },
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
}