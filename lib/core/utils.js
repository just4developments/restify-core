const restify = require('restify');
const path = require('path');
const uuid = require('node-uuid');
const _ = require('lodash');

/************************************
 ** CLASS HELPER
 ** 
 *************************************/

exports = module.exports = {
    Uuid: String,
    uuid() {
        return uuid.v4();
    },
    date(date) {
        if (exports.has(date) !== true || date instanceof Date) return date;
        return new Date(date);
    },
    boolean(bol) {
        if(!bol) return false;
        if(bol === true) return bol;
        return bol.toString().toLowerCase() === 'true';
    },
    object(object) {
        if(_.isNil(object)) return object;
        if (typeof object === 'string') {
            object = JSON.parse(object);
        }
        _.forOwn(object, (props, fieldName) => {
            if(typeof props === 'object'){
                object[fieldName] = exports.object(object[fieldName]);
            }else if(typeof props === 'string' && /^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}Z$/.test(props)){
                object[fieldName] = exports.date(object[fieldName]);
            }
        });
        return object;
    },
    is(params, type, fieldName) {
        if(type instanceof Array){
            for(var e of type){
                let msgs = [];
                try{
                    exports.is(params, e, fieldName);
                    return;
                }catch(e){                    
                    msgs.push(e.message);
                }                
            }
            throw new restify.BadRequestError(msgs.join(' or '));
        }else {
            if (Number === type && isNaN(params) === true) throw new restify.BadRequestError(`${fieldName} must be Number type`);
            else if (Date === type && !(params instanceof Date)) throw new restify.BadRequestError(`${fieldName} must be Date type`);
            else if (Boolean === type && _.isBoolean(params) !== true) throw new restify.BadRequestError(`${fieldName} must be Boolean type`);
            else if (Array === type && _.isArray(params) !== true) throw new restify.BadRequestError(`${fieldName} 'must be Array type`);
            else if (Object === type && _.isPlainObject(params) !== true) throw new restify.BadRequestError(`${fieldName} 'must be Object type`);
            else if (String === type && _.isString(params) !== true) throw new restify.BadRequestError(`${fieldName} 'must be String type`);
        }
    },
    valid(fieldName, params, type, defaultValue) {
        if(fieldName instanceof Array){
            for(let f of fieldName){
                if(f.reassign) f = exports.valid(f.field, f.value, f.type, f.defaultValue);
                else exports.valid(f.field, f.value, f.type, f.defaultValue);
            }
            return;
        }
        let msg;
        let value = params;
        if (!exports.has(value)) {
            if (!_.isNil(defaultValue)) value = defaultValue;
            else throw new restify.BadRequestError(`${fieldName} is required`);
        }
        if (type && (msg = exports.is(value, type, fieldName)) !== true) throw new restify.BadRequestError(`${fieldName} ${msg}`);
        return value;
    },
    has(value) {
        if (_.isNil(value) || (typeof value === 'string' && value.length === 0)) return false;
        return true;
    },
    jsonHandler(config) {
        return restify.bodyParser(config);
    },
    resizeImage({
        buf,
        file
    }, sizes) {
        return new Promise(async(resolve, reject) => {
            try {
                const Jimp = require('jimp');
                if (!(sizes instanceof Array)) sizes = [sizes];
                const resize = sizes.map(async(size) => {
                    if (!size.w && !size.h) throw 'Need enter size to resize image';
                    const fileout = file.substr(0, file.lastIndexOf('.')) + (size.ext ? ('.' + size.ext) : '') + file.substr(file.lastIndexOf('.'));
                    let image = await Jimp.read(buf);
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
                    image = await image.cover(size.w, size.h).quality(size.quality || 100).write(fileout);
                    image = null;
                    exports.gc();
                    return fileout;
                });
                const rs = await Promise.all(resize);
                resolve(rs);
            } catch (err) {
                reject(err);
            } finally {
                exports.gc();
            }
        });
    },
    gc() {
        if (global.gc) {
            global.gc();
        } else {
            console.log('Pass --expose-gc when launching node to enable forced garbage collection.');
        }
    },
    fileUploadHandler(config) {
        let baseConfig = {
            uploadDir: "assets/upload/",
            httpPath: "/upload/${filename}",
            keepName: false,
            resize: undefined,
            mapFiles: false,
            mapParams: false,
            keepExtensions: false,
            multiples: false,
            multipartFileHandler(part, req) {
                const defaultConfig = _.clone(config[part.name]);
                const filename = exports.uuid() + (part.filename.indexOf('.') !== -1 ? part.filename.substr(part.filename.lastIndexOf('.')) : '');
                try {
                    defaultConfig.uploadDir = eval(defaultConfig.uploadDir);    
                } catch (e) {}
                try {
                    defaultConfig.httpPath = eval(defaultConfig.httpPath);    
                } catch (e) {}
                const fileout = path.join(defaultConfig.uploadDir, filename);
                let buf = new Buffer(0);
                part.on('data', (data) => {
                    buf = Buffer.concat([buf, data]);
                })
                part.on('end', async () => {
                    const fs = require('fs-path');
                    fs.writeFileSync(fileout, buf, 'binary');
                    if (!req.file[part.name]) req.file[part.name] = defaultConfig.multiples ? [] : {};
                    if(defaultConfig.keepName) {                        
                        if (req.file[part.name] instanceof Array) {
                            req.file[part.name].push({
                                name: part.filename.substr(0, part.filename.lastIndexOf('.')),
                                path: defaultConfig.httpPath
                            });
                        } else {
                            req.file[part.name] = {
                                name: part.filename.substr(0, part.filename.lastIndexOf('.')),
                                path: defaultConfig.httpPath
                            };
                        }
                    }else {
                        if (req.file[part.name] instanceof Array) req.file[part.name].push(defaultConfig.httpPath.replace('${filename}', filename));
                        else req.file[part.name] = defaultConfig.httpPath;
                    }
                    if (defaultConfig.resize) {
                        try {
                            let rs = await exports.resizeImage({
                                buf: fileout,
                                file: fileout
                            }, defaultConfig.resize);
                            // Done
                        } catch (err) {
                            exports.deleteFile(fileout, defaultConfig.resize);
                            console.error('RESIZE', err);
                        }
                    }
                });
                // stream.on('close', async() => {
                //     if (defaultConfig.resize) {
                //         try {
                //             let rs = await exports.resizeImage({
                //                 buf: fileout,
                //                 file: fileout
                //             }, defaultConfig.resize);
                //             // Done
                //         } catch (err) {
                //             exports.deleteFile(fileout, defaultConfig.resize);
                //             console.error('RESIZE', err);
                //         }
                //     }
                // });
                // part.pipe(stream);
            }
        };
        if (config instanceof Object) {
            baseConfig = _.extend(baseConfig, config[Object.keys(config)[0]]);
            if (baseConfig.uploadDir) baseConfig.uploadDir = path.join(__dirname, '..', '..', baseConfig.uploadDir);
        } else {
            baseConfig.uploadDir = path.join(__dirname, '..', '..', config);
        }
        return [(req, res, next) => {
            if (!req.file) req.file = {};
            next();
            
        }, ...restify.bodyParser(baseConfig)];
    },
    getAbsoluteUpload(files, rootPath) {
        if (!files) return files;
        this.getPath = (f) => {
            return path.join(rootPath, f.substr(f.lastIndexOf('/') + 1));
        };
        if (!(files instanceof Array)) {
            return this.getPath(files);
        }
        return files.map((f) => {
            return this.getPath(f);
        });

    },
    deleteFile(files, sizes) {
        if (!files) return;
        const remove = (f, sizes) => {
            try {
                const fs = require('fs-path');
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
        files.forEach((f) => {
            remove(f, sizes);
        });
    },
    md5(str){
        const crypto = require('crypto');
        return crypto.createHash('md5').update(str).digest("hex");
    },
    base64(str, isDecode){
        if(!isDecode) return new Buffer(str).toString('base64');
        return Buffer.from(str, 'base64').toString('utf8');
    }
}