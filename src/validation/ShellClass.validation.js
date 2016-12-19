module.exports = {
    "title": "Validate config.json in zip file",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "yaml": {
            "type": "string"
        },
        "des": {
            "type": "string"
        },
        "scripts": {
            "$ref": "#/definitions/scriptObject"
        },
        "input": {
            "type": "array",
            "items": {
                "anyOf": [{
                    "$ref": "#/definitions/targetRequired"
                }, {
                    "$ref": "#/definitions/inputControl"
                }]
            },
            "uniqueItems": true
        },
        "testing": {
            "type": "array",
            "items": {
                "anyOf": [{
                    "$ref": "#/definitions/testingObject"
                }]                
            },
            "uniqueItems": true
        }
    },
    "additionalProperties": false,
    "required": ["name"],
    "definitions": {
        "testingObject": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string"
                },
                "des": {
                    "type": "string"
                },
                "script": {
                    "type": "string"
                },
                "scripts": {
                    "$ref": "#/definitions/scriptObject"          
                },
                "input": {
                    "type": "array",
                    "items": {
                        "anyOf": [{
                            "$ref": "#/definitions/inputControl"
                        }]
                    },
                    "uniqueItems": true
                }
            },
            "required": ["name", "script"]
        },
        "scriptObject": {
            "type": "object",
            "patternProperties": {
                "^.+": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        },
                        "cmd": {
                            "type": "string"
                        },
                        "data": {
                            "type": "object"
                        }
                    },
                    "required": ["name", "script"]
                }
            },
            "additionalProperties": true
        },
        "targetRequired": {
            "type": "object",
            "properties": {
                "param": {
                    "enum": ["target"]
                },
                "label": {
                    "type": "string"
                },
                "default": {
                    "type": ["string"]
                },
                "component": {
                    "enum": ["select-box", "text", "radio", "multi-choice"]
                },
                "data": {
                    "type": "array"
                }
            },
            "required": ["param", "label", "component"],
            "additionalProperties": false
        },
        "inputControl": {
            "type": "object",
            "properties": {
                "param": {
                    "type": "string"
                },
                "label": {
                    "type": "string"
                },
                "type": {
                    "enum": ["Number", "String", "Date"]
                },
                "default": {
                    "type": ["string", "number"]
                },
                "component": {
                    "enum": ["select-box", "text", "date", "radio", "multi-choice"]
                },
                "data": {
                    "type": "array"
                }
            },
            "required": ["param", "label", "type", "component"],
            "additionalProperties": false
        }
    }
}