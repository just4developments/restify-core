const fs = require('fs');
let path = require('path');
let _ = require('lodash');

JSON.ostringify = (a, b, c) => {
    return JSON.stringify(a, b, c).replace(/\"([^(\")"]+)\":/g,"$1:");
}
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
                Key.validateDeService = (item) => {
                    return `if((msg = utils.has(${item})) !== true) throw new restify.BadRequestError(\`${fieldName} \$\{msg\}\`);`;   
                }
                Key.validateUpService = (item) => {
                    return `if((msg = utils.has(${item}.${fieldName})) !== true) throw new restify.BadRequestError(\`${fieldName} \$\{msg\}\`);`;   
                }
                Key.validateFiService = (item) => {
                    return null;
                };
                Key.validateGeService = (item) => {
                    return `if((msg = utils.has(${item}) !== true)) throw new restify.BadRequestError(\`${fieldName} \$\{msg\}\`);`;  
                } 
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
                String.assignUpController = String.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = req.body.${fieldName};`;
                if (defaultValue === undefined) {
                    String.upHttp = String.inHttp = `${fieldName}: ''`;
                    String.validateUpService = String.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, String);`;
                    }
                } else if (defaultValue === null) {
                    String.upHttp = String.inHttp = `${fieldName}: null`;                    
                } else {
                    String.upHttp = String.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                    String.validateUpService = String.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, String, ${JSON.stringify(defaultValue)});`;                        
                    }
                }

            }
            return String;
        },
        Number: (defaultValue) => {
            let Number = class Number {};
            Number.defaultValue = +defaultValue;
            Number.gen = (fieldName) => {
                Number.fieldName = fieldName;
                Number.assignUpController = Number.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = +req.body.${fieldName};`;                
                if (defaultValue === undefined) {
                    Number.upHttp = Number.inHttp = `${fieldName}: 0`;
                    Number.validateUpService = Number.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Number);`;
                    }                    
                } else if (defaultValue === null) {
                    Number.upHttp = Number.inHttp = `${fieldName}: null`;                    
                } else {
                    Number.upHttp = Number.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                    Number.validateUpService = Number.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Number, ${JSON.stringify(defaultValue)});`;
                    }
                }

            }
            return Number;
        },
        Boolean: (defaultValue) => {
            let Boolean = class Boolean {};
            Boolean.defaultValue = +defaultValue;
            Boolean.gen = (fieldName) => {
                Boolean.fieldName = fieldName;
                Boolean.assignUpController = Boolean.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.boolean(req.body.${fieldName});`;
                if (defaultValue === undefined) {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: 0`;
                    Boolean.validateUpService = Boolean.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Boolean);`;
                    }                    
                } else if (defaultValue === null) {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: null`;                    
                } else {
                    Boolean.upHttp = Boolean.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                    Boolean.validateUpService = Boolean.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Boolean, ${JSON.stringify(defaultValue)});`;
                    }
                }

            }
            return Boolean;
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
                Date.assignUpController = Date.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.date(req.body.${fieldName});`;
                if (defaultValue === undefined) {
                    Date.validateUpService = Date.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Date);`;
                    }
                    Date.upHttp = Date.inHttp = `${fieldName}: new Date()`;                    
                } else if (defaultValue === null) {
                    Date.upHttp = Date.inHttp = `${fieldName}: null`;                    
                }else {
                    Date.upHttp = Date.inHttp = `${fieldName}: ${defaultValue}`;
                    Date.validateUpService = Date.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Date, ${defaultValue});`;                        
                    }
                }

            }
            return Date;
        },
        Object: (schema, defaultValue) => {
            let Object = class Object {};
            Object.schema = schema;
            Object.defaultValue = defaultValue;
            Object.gen = (fieldName) => {
                Object.fieldName = fieldName;
                Object.assignUpController = Object.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.object(req.body.${fieldName});`;
                let checkWhenHas = (item) => {
                        let rs = new MyArray();
                        for(let fieldName1 in schema){
                            let fieldType = schema[fieldName1];                            
                            if(!fieldType.prototype){
                                fieldType = Reflect.apply(fieldType, undefined, []);
                            }
                            fieldType.gen(fieldName1);
                            rs.push(fieldType.validateUpService ? fieldType.validateUpService(`${item}.${fieldName}`) : null);
                        }
                        return `${rs.join('\n')}`;
                }
                if (defaultValue === undefined) {
                    Object.upHttp = Object.inHttp = `${fieldName}: {}`;
                    Object.validateUpService = Object.validateInService = (item) => {
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Object);`;
                        if(schema) cnt += `${checkWhenHas(item)}`;
                        return cnt;                
                    }
                } else if (defaultValue === null) {
                    Object.upHttp = Object.inHttp = `${fieldName}: null`;
                } else {
                    Object.upHttp = Object.inHttp = `${fieldName}: ${JSON.stringify(defaultValue)}`;
                    Object.validateUpService = Object.validateInService = (item) => {                        
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Object, ${JSON.ostringify(defaultValue, null, '\t').replace(/\n/g, '\n')});`;
                        if(schema) cnt += `${checkWhenHas(item)}`;
                        return cnt;
                    }
                }

            }
            return Object;
        },
        Array: (schema, defaultValue) => {
            let Array = class Array {};
            Array.schema = schema;
            Array.defaultValue = defaultValue;
            Array.gen = (fieldName) => {
                let ijk = ['i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q'];
                Array.fieldName = fieldName;
                Array.assignUpController = Array.assignInController = `if(utils.has(req.body.${fieldName}) === true) body.${fieldName} = utils.object(req.body.${fieldName});`;
                let checkWhenHas = (item, i) => {
                    let rs = new MyArray();
                    for(let fieldName1 in schema){
                        let fieldType = schema[fieldName1];                            
                        if(!fieldType.prototype){
                            fieldType = Reflect.apply(fieldType, undefined, []);
                        }
                        fieldType.gen(fieldName1);
                        rs.push(fieldType.validateUpService ? fieldType.validateUpService(`${item}.${fieldName}[${ijk[i]}]`, i+1): null);
                    }
                    return `for(let ${ijk[i]} in ${item}.${fieldName}){
                                ${rs.join('\n')}
                            }`;
                }
                if (defaultValue === undefined) {
                    Array.validateUpService = Array.validateInService = (item, i) => {
                        i = i || 0;
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Array);`;
                        if(schema) cnt += `${checkWhenHas(item, i)}`;
                        return cnt;
                    }
                    Array.upHttp = Array.inHttp = `${fieldName}: []`;
                    
                } else if (defaultValue === null) {
                    Array.upHttp = Array.inHttp = `${fieldName}: null`;
                } else {
                    Array.validateUpService = Array.validateInService = (item, i) => {
                        i = i || 0;
                        let cnt = `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, Array, ${JSON.ostringify(defaultValue, null, '\t').replace(/\n/g, '\n')});`;                                                
                        if(schema) cnt += `${checkWhenHas(item, i)}`;
                        return cnt;
                    }
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
                File.assignUpController = File.assignInController = `if(utils.has(req.file.${fieldName}) === true) body.${fieldName} = req.file.${fieldName};`;
                if (defaultValue === undefined) {                        
                    File.validateUpService = File.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, ${config.multiples ? 'Array' : 'String'});`;
                    }
                    File.upHttp = File.inHttp = `'file:${fieldName}': ''`;
                } else if (defaultValue === null) {
                    // File.validateUpService = File.validateInService = (item) => {`item.${fieldName} = item.${fieldName} || null;`;
                    File.upHttp = File.inHttp = `'file:${fieldName}': null`;
                } else {
                    File.validateUpService = File.validateInService = (item) => {
                        return `${item}.${fieldName} = utils.valid('${fieldName}', ${item}.${fieldName}, ${config.multiples ? 'Array' : 'String'}, ${JSON.stringify(defaultValue)});`;                            
                    }
                    File.upHttp = File.inHttp = `'file:${fieldName}': ${defaultValue}`;
                }
                File.declareMiddleInController = `${fieldName}: ${Object.keys(config).length === 1 ? `'${config.uploadDir}'` : Native.toString(config)}`;
            }
        return File;
    }
};