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
        "input": {
            "type": "array",
            "items": {
                "anyOf": [
                    {"$ref": "#/definitions/selectBox"}
                ]
            },
            "uniqueItems": true
        }
    },
    "required": ["name"],
    "definitions": {
        "selectBox": {
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