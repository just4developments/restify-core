let path = require('path');
let restify = require('restify');
let fs = require('fs');
let async = require('async');

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
            sizes.forEach((size) => {
                rstasks.push(((file, size, cb) => {
                    let fileout = file.substr(0, file.lastIndexOf('.')) + '.' + size.ext + file.substr(file.lastIndexOf('.'));
                    Jimp.read(file).then((image) => {
                        var w, h;
                        if (image.bitmap.width > image.bitmap.height) {
                            w = image.bitmap.width * size.h / image.bitmap.height;
                            h = size.h;
                        } else {
                            h = image.bitmap.height * size.w / image.bitmap.width;
                            w = size.w;
                        }
                        var x = 0; //Math.abs((w-size.w)/2)*-1;
                        var y = 0; //Math.abs((h-size.h)/2)*-1;
                        image.resize(w, h)
                            .crop(x, y, size.w, size.h)
                            .quality(100)
                            .write(fileout, (params) => {
                                image = null;
                                cb(null, fileout);
                            });
                    }).catch(reject);
                }).bind(null, file, size));
            });
            async.series(rstasks, (err, results) => {
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
                        fs.writeFile(fileout, buf, 'binary', (err) => {
                            buf = null;
                            if(err) return console.error('UPLOAD_FILE', err);
                            if (!req.file) req.file = {};
                            if (!req.file[part.name]) req.file[part.name] = defaultConfig.multiples ? [] : {};
                            if (req.file[part.name] instanceof Array) req.file[part.name].push(defaultConfig.httpPath.replace('${filename}', filename));
                            else req.file[part.name] = defaultConfig.httpPath.replace('${filename}', filename);
                            if (defaultConfig.resize) {
                                exports.resizeImage(fileout, defaultConfig.resize).catch((err) => {
                                    console.error('RESIZE_IMAGE', err);
                                });
                            }    
                        });                        
                    });
                }
                // multipartHandler: function (part) {
                //     part.on('data', function (data) { });
                // },
        };
        if (config instanceof Object) {
            defaultConfig = Object.assign(defaultConfig, config);
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