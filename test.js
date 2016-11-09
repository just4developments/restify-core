var schema = require('./src/validation/ShellClass.validation');

var data = {
    name: "thanh",
    input: [{
        "var": "a",
        "label": "A",
        "type": "Number",
        "default": 1,
        "component": "select-box",
        "data": [{
            "0": "None"
        }, {
            "1": "Pick someone"
        }]
    }, {
        "var": "b",
        "label": "B",
        "type": "Number",
        "default": 2,
        "component": "text"
    }, {
        "var": "c",
        "label": "C",
        "type": "String",
        "default": "Hello world",
        "component": "text"
    }, {
        "var": "d",
        "label": "D",
        "type": "Date",
        "default": "",
        "component": "date"
    }, {
        "var": "e",
        "label": "E",
        "type": "Number",
        "default": 1,
        "component": "radio",
        "data": [{
            "0": "1st choice"
        }, {
            "1": "2nd choice"
        }]
    }, {
        "var": "f",
        "label": "F",
        "type": "Number",
        "default": 1,
        "component": "multi-choice",
        "data": [{
            "0": "Hi"
        }, {
            "1": "The"
        }, {
            "2": "World"
        }, {
            "3": "You"
        }]
    }]
};

var Ajv = require('ajv');
var ajv = new Ajv();
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);
else console.log('ok');