let path = require('path');

module.exports = {
    tables: {
        // ShellClass: {
        //     _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
        //     name: String,
        //     des: Stringable,
        //     category_id: Numberable,            
        //     input: Arrayable,
        //     output: Arrayable,
        //     content: String,
        //     target: String,
        //     createdDate: Dateignore,
        //     updatedDate: Dateignore
        //     category_id: Number,
        //     money: Number,
        //     created_date: Dateignore,
        //     images: FileUpload({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
        //     details: Arrayable
        // },
        // ExecutingLogs: {
        //     _id: Key(String),
        //     event_type: Number,
        //     status: Number,
        //     result: Object,            
        //     title: String,
        //     shellclass_id: String,
        //     started_time: Dateignore,
        //     finished_time: Dateable
        //     name: String
        // },
        // transaction: {
        //     _id: Key(String),
        //     product: Object,
        //     quantity: Number,
        //     money: Number,
        //     created_date: Dateignore,
        //     status: Number
        // },
        ShellInstance: {
            _id: Key(String),
            target: Object,
            shell_instances: Arrayable,
            created_date: Dateignore,
            updated_date: Dateignore
        }
    },
    outdir: 'src'
}