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
    resizeImage: (file, sizes) => {
        return new Promise((resolve, reject) => {
            let Jimp = require('jimp');
            let rstasks = [];
            if(!(sizes instanceof Array)) sizes = [sizes];
            for(let size of sizes){
                rstasks.push(((file, size, cb) => {
                    if(!size.w && !size.h) return cb('Need enter size to resize image');
                    let fileout = file.substr(0, file.lastIndexOf('.')) + (size.ext ? ('.' + size.ext) : '') + file.substr(file.lastIndexOf('.'));
                    Jimp.read(file).then((image) => {
                        var w, h;
                        if(!size.w && size.h){
                            if(size.h < 0) {
                                size.h = Math.abs(size.h);
                                size.h = image.bitmap.height > size.h ? size.h : image.bitmap.height;
                            } 
                            size.w = w = image.bitmap.width * size.h / image.bitmap.height;
                            h = size.h;
                        }else if(!size.h && size.w){
                            if(size.w < 0) {
                                size.w = Math.abs(size.w);
                                size.w = image.bitmap.width > size.w ? size.w : image.bitmap.width;
                            }
                            size.h = h = image.bitmap.height * size.w / image.bitmap.width;
                            w = size.w;
                        }else{
                            if (image.bitmap.width > image.bitmap.height) {
                                w = image.bitmap.width * size.h / image.bitmap.height;
                                h = size.h;
                            } else {
                                h = image.bitmap.height * size.w / image.bitmap.width;
                                w = size.w;
                            }                            
                        }
                        // let x = 0; //Math.abs((w-size.w)/2)*-1;
                        // let y = 0; //Math.abs((h-size.h)/2)*-1;
                        let x = Math.abs((w-size.w)/2);
                        let y = Math.abs((h-size.h)/2);
                        
                        image.resize(w, h)
                            .crop(x, y, size.w, size.h)
                            .quality(100)
                            .write(fileout, (params) => {
                                image = null;
                                cb(null, fileout);
                            });
                    }).catch(cb);
                }).bind(null, file, size));
            }
            async.series(rstasks, (err, results) => {
                rstasks = null;
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    fileUploadHandler: (config) => {
        let defaultConfig = {
            uploadDir: "assets/upload/",
            httpPath: "/upload/${filename}",
            resize: undefined,
            mapFiles: false,
            mapParams: false,
            keepExtensions: false,
            multiples: false,
            multipartFileHandler: (part, req) => {
                    let buf;
                    let filename = exports.uuid() + (part.filename.indexOf('.') !== -1 ? part.filename.substr(part.filename.lastIndexOf('.')) : '');
                    let fileout = path.join(defaultConfig.uploadDir, filename);
                    part.on('data', function (data) {
                        if(!buf) buf = Buffer.from(data, 'binary');
                        else buf = Buffer.concat([buf, data]);
                    });
                    part.on('end', () => {
                        if (!req.file) req.file = {};
                        if (!req.file[part.name]) req.file[part.name] = defaultConfig.multiples ? [] : {};
                        if (req.file[part.name] instanceof Array) req.file[part.name].push(defaultConfig.httpPath.replace('${filename}', filename));
                        else req.file[part.name] = defaultConfig.httpPath.replace('${filename}', filename);
                        fs.writeFileSync(fileout, buf, 'binary');
                        buf = null;
                        if (defaultConfig.resize) {
                            let sizes = _.clone(defaultConfig.resize);
                            let reject = (err) => {
                                console.error(err);
                            };
                            let resolve = (file) => {
                                console.log("Resize done ", file);
                            };
                            let resizeNow = sizes.find((e) => {
                                return e.ext === undefined;
                            });
                            if(resizeNow){
                                exports.resizeImage(fileout, _.clone(resizeNow)).then((file) => {
                                    sizes.splice(sizes.indexOf(resizeNow), 1);
                                    exports.resizeImage(fileout, sizes).then(resolve).catch(reject);
                                }).catch(reject);
                            }else{
                                exports.resizeImage(fileout, sizes).then(resolve).catch(reject);
                            }
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
            if(sizes){
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
    }
}