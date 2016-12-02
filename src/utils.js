let path = require('path');
let restify = require('restify');
let fs = require('fs');
let async = require('async');
let _ = require('lodash');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = {
    uuid: () => {
        let uuid = require('node-uuid');
        return uuid.v4();
    },
    has: (params) => {
        return params !== undefined && params !== null;
    },
    jsonHandler: (config) => {
        return restify.bodyParser(config);
    },
    resizeImage: ({buf, file}, sizes) => {
        return new Promise((resolve, reject) => {
            let Jimp = require('jimp');
            let rstasks = [];
            if (!(sizes instanceof Array)) sizes = [sizes];
            for (let size of sizes) {
                rstasks.push(((buf, file, size, cb) => {
                    if (!size.w && !size.h) return cb('Need enter size to resize image');
                    let fileout = file.substr(0, file.lastIndexOf('.')) + (size.ext ? ('.' + size.ext) : '') + file.substr(file.lastIndexOf('.'));
                    Jimp.read(buf).then((image) => {
                        if (size.h < 0) {
                            size.h = Math.abs(size.h);
                            size.h = image.bitmap.height > size.h ? size.h : image.bitmap.height;
                        }
                        if (size.w < 0) {
                            size.w = Math.abs(size.w);
                            size.w = image.bitmap.width > size.w ? size.w : image.bitmap.width;
                        }
                        if (!size.w) size.w = size.h * image.bitmap.width / image.bitmap.height;
                        if (!size.h) size.h = size.w * image.bitmap.height / image.bitmap.width;
                        if (size.ratio) {
                            size.w *= size.ratio;
                            size.h *= size.ratio;
                        }
                        image.cover(size.w, size.h)
                            .quality(size.quality || 100)
                            .write(fileout, (err) => {
                                image = null;
                                exports.gc();
                                cb(null, fileout);
                            });
                    }).catch(cb);
                }).bind(null, buf, file, size));
            }
            async.series(rstasks, (err, results) => {
                rstasks = null;
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    gc: () => {
        if (global.gc) {
            global.gc();
        } else {
            console.log('Garbage collection unavailable.  Pass --expose-gc when launching node to enable forced garbage collection.');
        }
    },
    fileUploadHandler: (config) => {
        let defaultConfig = {
            maxBodySize: 0,
            uploadDir: "assets/upload/",
            httpPath: "/upload/${filename}",
            resize: undefined,
            mapFiles: false,
            mapParams: false,
            keepExtensions: false,
            multiples: false,
            multipartFileHandler: (part, req) => {
                    let filename = exports.uuid() + (part.filename.indexOf('.') !== -1 ? part.filename.substr(part.filename.lastIndexOf('.')) : '');
                    let fileout = path.join(defaultConfig.uploadDir, filename);
                    let buf = new Buffer(0);
                    let reject = (err) => {
                        buf = null;
                        exports.gc();
                        exports.deleteFile(fileout, defaultConfig.resize);
                        console.error('RESIZE', err);
                    };
                    let resolve = (file) => {
                        // console.log("RESIZE", file);
                        buf = null;
                        exports.gc();
                    };
                    part.on('data', function (data) {
                        buf = Buffer.concat([buf, data]);
                    });
                    part.on('end', () => {
                        try{
                            fs.writeFileSync(fileout, buf, {
                                encoding: 'binary'
                            });
                            buf = fileout;
                            exports.gc();
                        
                            if (!req.file) req.file = {};
                            if (!req.file[part.name]) req.file[part.name] = defaultConfig.multiples ? [] : {};
                            if (req.file[part.name] instanceof Array) req.file[part.name].push(defaultConfig.httpPath.replace('${filename}', filename));
                            else req.file[part.name] = defaultConfig.httpPath.replace('${filename}', filename);
                            if (defaultConfig.resize) {
                                exports.resizeImage({
                                    buf: buf,
                                    file: fileout
                                }, defaultConfig.resize).then(resolve).catch(reject);
                            }
                        }catch(e){
                            reject(e);
                            throw e;
                        }
                    });
                }
                // multipartHandler: function (part) {
                //     part.on('data', function (data) { });
                // },
        };
        if (config instanceof Object) {
            defaultConfig = _.extend(defaultConfig, config);
            if (defaultConfig.uploadDir) defaultConfig.uploadDir = path.join(__dirname, '..', defaultConfig.uploadDir);
        } else {
            defaultConfig.uploadDir = path.join(__dirname, '..', config);
        }
        return restify.bodyParser(defaultConfig);
    },
    getAbsoluteUpload: (files, rootPath) => {
        if (!files) return files;
        this.getPath = (f) => {
            return path.join(rootPath, f.substr(f.lastIndexOf('/') + 1));
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
    deleteFile: (files, sizes) => {
        if (!files) return;
        let remove = (f, sizes) => {
            try {
                fs.statSync(f);
                fs.unlinkSync(f);
            } catch (e) { /*File was removed before that*/ }
            if (sizes) {
                sizes.forEach((s) => {
                    remove(f.substr(0, f.lastIndexOf('.')) + '.' + s.ext + f.substr(f.lastIndexOf('.')));
                });
            }
        };
        if (!(files instanceof Array)) {
            return remove(files, sizes);
        }
        for (var f of files) {
            remove(f, sizes);
        }
    },
    getPathUpload: (file, returnPath, multiples) => {
        if (file instanceof Array) {
            return file.map((f) => {
                return returnPath + path.basename(f.path)
            });
        }
        if (multiples) return [returnPath + path.basename(file.path)];
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