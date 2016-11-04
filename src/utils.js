const path = require('path');
const restify = require('restify');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

module.exports = {
    fileUploadHandler: (config) => {
        let defaultConfig = {
            mapFiles: true,
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
            defaultConfig.uploadDir = path.join(__dirname, '..', defaultConfig.uploadDir);
        } else {
            defaultConfig.uploadDir = path.join(__dirname, '..', config);
        }
        return restify.bodyParser(defaultConfig);
    },
    getPathUpload: (file, returnPath) => {
        return returnPath + path.basename(file.path);
    }
}

// FileUpload.prototype.config = `restify.bodyParser(${JSON.stringify(Object.assign({
//         // maxBodySize: 0, mapParams: true, overrideParams: false,                
//         //multipartHandler: function (part) {part.on('data', function (data) { /* do something with the multipart data */ });},multipartFileHandler: function (part) {part.on('data', function (data) { /* do something with the multipart file data */ });},
//         mapFiles: true,
//         keepExtensions: true,
//         // uploadDir: 'path.join(__dirname)',
//         // multiples: false,
//         // hash: 'sha1'
//     }, config), null, '\t').replace(/"path.join\(([^\)]+)\)"/, 'path.join($1)')}),`;