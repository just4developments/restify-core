<<<<<<< HEAD
var schema = require('./src/validation/ShellClass.validation');

var data = {
    "name": "Script 2",
    "des": "Description script 2",
    "scripts": { 
        "getInformation": { "script": "infor.sh", "name": "Deploy to server", "target": "${target}" }
    },
    "input": [{
        "param": "target",
        "label": "Chon may ao",
        "default": "May ao 01",
        "component": "text"
    }, {
        "param": "x",
        "label": "Parameter for X",
        "type": "Number",
        "default": 1,
        "component": "select-box",
        "data": [{
            "0": "None"
        }, {
            "1": "Pick someone"
        }]
    }, {
        "param": "y",
        "label": "Parameter for Y",
        "type": "Number",
        "default": 2,
        "component": "text"
    }
    ],
    "plugins": [{
        "name": "Item chidl 1",
        "script": "tst.sh",
        "scripts": {
            "test1": {
                "script": "infor-child.sh",
                "name": "Testcase information",
                "x": "${x}",
                "y": "${y}"
            }
        },
        "des": "Description script 2",
        "input": [{
            "param": "x",
            "label": "Parameter for X",
            "type": "Number",
            "default": 1,
            "component": "select-box",
            "data": [{
                "0": "None"
            }, {
                "1": "Pick someone"
            }]
        }, {
            "param": "y",
            "label": "Parameter for Y",
            "type": "Number",
            "default": 2,
            "component": "text"
        }]
    }]
};

var Ajv = require('ajv');
var ajv = new Ajv();
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
else console.log('ok');
=======
var async = require('async');
let a = {b: 10};
async.series([((a, cb)=>{
    a.b++;
    cb(null, a);
}).bind(null, a), ((a, cb)=>{
    a.b++;
    a = null;
    cb(null, a);
}).bind(null, a)], (err, vl) => {
    console.log(a);
})
>>>>>>> 51a79012ee5110f7aeab24e479d575182f79228b
