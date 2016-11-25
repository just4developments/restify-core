module.exports = {
    "title": "Validate config.json in zip file",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "des": {
            "type": "string"
        },
        "scripts": {
            "type": "object",
            "patternProperties": {
                ".+": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string"
                        }
                    },
                    "required": ["name"]
                }
            }            
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
        "plugins": {
            "type": "array",
            "items": {
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
                    "type": "object",
                    "patternProperties": {
                        ".+": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string"
                                }
                            },
                            "required": ["name"]
                        }
                    }            
                },
                "input": {
                    "type": "array",
                    "items": {
                        "anyOf": [{
                            "$ref": "#/definitions/inputControl"
                        }]
                    },
                    "uniqueItems": true
                },
                "required": ["name", "script"],
            },
            "uniqueItems": true
        }
    },
    "required": ["name"],
    "definitions": {
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
        }
    }
}