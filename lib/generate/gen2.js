const fs = require('fs');
let path = require('path');
let _ = require('lodash');

global.MyArray = class MyArray extends Array {
    push(data) {
        if(data !== undefined && data !== null) {
            super.push(data);
        }   
    }    
}
global.Native = (value) => {
    return `$Native(${value})`;
}
global.Native.toString = (vl) => {
    if(typeof vl === 'object'){
        vl = JSON.stringify(vl);
    }
    return vl.replace(/"?\$Native\(([^\)]+)\)"?/g, '$1');
}
global.GenType = {
        Key: (type, defaultValue) => {
            let Key = class Key {};
            Key.defaultValue = defaultValue;
            Key.sign = type.name === 'Number' ? '+' : '';
            Key.gen = (fieldName) => {
                Key.fieldName = fieldName;                
                Key.validateDeService = Key.validateUpService = `if(!utils.has(item)) throw new restify.BadRequestError('${fieldName} is required!');`;
                Key.validateFiService;
                Key.validateGeService = `if(!utils.has(item)) throw new restify.BadRequestError('${fieldName} is required!');`;
                Key.upHttp = Key.inHttp = `${fieldName}: `;
                if (defaultValue === undefined) {
                    
                } else if (defaultValue === null) {
                    
                } else if ('uuid' === defaultValue) {
                    Key.assignInController = `body.${fieldName} = utils.uuid();`;
                }
                Key.assignUpController = `body.${fieldName} = ${Key.sign}req.params.${fieldName}`;

            }            
            return Key;
        },
        String: (defaultValue) => {
            let String = class String {};
            String.defaultValue = defaultValue;
            String.gen = (fieldName) => {
                String.fieldName = fieldName;
                String.upHttp = String.inHttp = `${fieldName}: `;
                String.assignUpController = String.assignInController = `body.${fieldName} = req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    String.validateUpService = String.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');`;                    
                } else {
                    String.validateUpService = String.validateInService = `item.${fieldName} = item.${fieldName} || ${JSON.stringify(defaultValue)};`;
                }

            }
            return String;
        },
        Number: (defaultValue) => {
            let Number = class Number {};
            Number.defaultValue = +defaultValue;
            Number.gen = (fieldName) => {
                Number.fieldName = fieldName;
                Number.upHttp = Number.inHttp = `${fieldName}: `;
                Number.assignUpController = Number.assignInController = `body.${fieldName} = +req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    Number.validateUpService = Number.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');`;                    
                } else {
                    Number.validateUpService = Number.validateInService = `item.${fieldName} = +item.${fieldName} || ${JSON.stringify(defaultValue)};`;
                }

            }
            return Number;
        },
        Date: (...yyyy) => {
            let Date = class Date {};
            let defaultValue = yyyy.length === 0 ? undefined : (yyyy[0] === null ? null : yyyy.join(','));
            if (!_.isNil(defaultValue)) {
                defaultValue = defaultValue === 'now' ? 'new Date()' : `new Date(${defaultValue})`;
            }
            Date.defaultValue = defaultValue;
            Date.gen = (fieldName) => {
                Date.fieldName = fieldName;
                Date.assignUpController = Date.assignInController = `body.${fieldName} = utils.date(req.body.${fieldName});`;
                if (defaultValue === undefined) {
                    Date.validateUpService = Date.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');`;
                    Date.upHttp = Date.inHttp = `${fieldName}: new Date()`;                    
                } else if (defaultValue === null) {
                    Date.upHttp = Date.inHttp = `${fieldName}: null`;
                    Date.validateUpService = Date.validateInService = `item.${fieldName} = +item.${fieldName} || null;`;                    
                }else {
                    Date.upHttp = Date.inHttp = `${fieldName}: ${defaultValue}`;
                    Date.validateUpService = Date.validateInService = `item.${fieldName} = utils.date(item.${fieldName}) || ${defaultValue}};`;
                }

            }
            return Date;
        },
        Object: (defaultValue) => {
            let Object = class Object {};
            Object.defaultValue = defaultValue;
            Object.gen = (fieldName) => {
                Object.fieldName = fieldName;
                Object.assignUpController = Object.assignInController = `body.${fieldName} = req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    Object.upHttp = Object.inHttp = `${fieldName}: {}`;
                    Object.validateUpService = Object.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');
if(!utils.is(item.${fieldName}, Object)) throw new restify.BadRequestError('${fieldName} must be Object!');`;
                    
                } else if (defaultValue === null) {
                    Object.upHttp = Object.inHttp = `${fieldName}: null`;
                    Object.validateUpService = Object.validateInService = `item.${fieldName} = item.${fieldName} || null;`;
                } else {
                    Object.upHttp = Object.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                    Object.validateUpService = Object.validateInService = `item.${fieldName} = item.${fieldName} || ${JSON.stringify(defaultValue)};`;
                }

            }
            return Object;
        },
        Array: (defaultValue) => {
            let Array = class Array {};
            Array.defaultValue = defaultValue;
            Array.gen = (fieldName) => {
                Array.fieldName = fieldName;
                Array.assignUpController = Array.assignInController = `body.${fieldName} = req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    Array.validateUpService = Array.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');
if(!utils.is(item.${fieldName}, Array)) throw new restify.BadRequestError('${fieldName} must be Array!');`;
                    Array.upHttp = Array.inHttp = `${fieldName}: []`;
                    
                } else if (defaultValue === null) {
                    Array.validateUpService = Array.validateInService = `item.${fieldName} = item.${fieldName} || null;`;
                    Array.upHttp = Array.inHttp = `${fieldName}: null`;
                } else {
                    Array.validateUpService = Array.validateInService = `item.${fieldName} = item.${fieldName} || ${JSON.stringify(defaultValue)};`;
                    Array.upHttp = Array.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                }

            }
            return Array;
        },
        File: (config, defaultValue) => {
                let File = class File {};
                if (!config) throw 'Not config upload path yet';
                File.config = config;
                File.gen = (fieldName) => {
                    File.fieldName = fieldName;
                    let dir = path.join(__dirname, '..', '..', config.uploadDir);
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    File.assignUpController = File.assignInController = `body.${fieldName} = req.file.${fieldName};`;
                    if (defaultValue === undefined) {
                        File.validateUpService = File.validateInService = `if(!utils.has(item.${fieldName})) throw new restify.BadRequestError('${fieldName} is required!');`;
                        File.upHttp = File.inHttp = `'file:${fieldName}': ''`;
                    } else if (defaultValue === null) {
                        File.assignUpController = File.assignInController = `item.${fieldName} = item.${fieldName} || null;`;
                        File.upHttp = File.inHttp = `'file:${fieldName}': null`;
                    } else {
                        File.assignUpController = File.assignInController = `item.${fieldName} = item.${fieldName} || ${defaultValue};`;
                        File.upHttp = File.inHttp = `'file:${fieldName}': ${defaultValue}`;
                    }
                    File.declareMiddleInController = `${fieldName}: ${Object.keys(config).length === 1 ? `'${config.uploadDir}'` : Native.toString(config)}`;
                }
        return File;
    }
};

let config = require('./initial');
let genController = require('./gen.controller');
let genService = require('./gen.service');
let genHttp = require('./gen.http');

for(let tblName in config.tables){
    let props = config.tables[tblName];
    let fieldsType = new MyArray();
    let fieldsKeyType;
    for(let fieldName in props){
        let fieldType = props[fieldName];
        if(!fieldType.prototype){
            fieldType = Reflect.apply(fieldType, undefined, []);
        }
        fieldType.gen(fieldName);
        fieldsType.push(fieldType);
        if(fieldType.name === 'Key'){
            fieldsKeyType = fieldType;
        }
    }
    genController(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genService(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
    genHttp(tblName, fieldsKeyType, fieldsType).writeTo(config.outdir);
}