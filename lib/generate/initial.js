const path = require('path');

module.exports = {
    tables: {
        product: {
            _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
            name: String,
            des: Stringable,
            category_id: Number,
            money: Number,
            created_date: Dateignore,
            images: FileUpload({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
            details: Arrayable
        },
        category: {
            _id: Key(String),
            name: String
        },
        transaction: {
            _id: Key(String),
            product: Object,
            quantity: Number,
            money: Number,
            created_date: Dateignore,
            status: Number
        },
        test1: {
            _id: Key(String),
            name: Stringable,
            images: FileUpload({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
        }
    },
    outdir: 'src'
}