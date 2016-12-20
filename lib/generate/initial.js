let path = require('path');

// module.exports = {
//     tables: {
//         // ShellClass: {
//         //     _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
//         //     name: String,
//         //     des: Stringable,
//         //     category_id: Numberable,            
//         //     input: Arrayable,
//         //     output: Arrayable,
//         //     content: String,
//         //     target: String,
//         //     createdDate: Dateignore,
//         //     updatedDate: Dateignore
//         // product: {
//         //     _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
//         //     name: String,
//         //     des: Stringable,
//         //     category_id: Number,
//         //     money: Number,
//         //     created_date: Dateignore,
//         //     images: FileUpload({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
//         //     details: Arrayable
//         // },
//         // ExecutingLogs: {
//         //     _id: Key(String),
//         //     event_type: Number,
//         //     status: Number,
//         //     result: Object,            
//         //     title: String,
//         //     shellclass_id: String,
//         //     started_time: Dateignore,
//         //     finished_time: Dateable
//         // category: {
//         //     _id: Key(String),
//         //     name: String
//         // },
//         // transaction: {
//         //     _id: Key(String),
//         //     product: Object,
//         //     quantity: Number,
//         //     money: Number,
//         //     created_date: Dateignore,
//         //     status: Number
//         // },
//         // ShellInstance: {
//         //     _id: Key(String),
//         //     target: Object,
//         //     shell_instances: Arrayable,
//         //     created_date: Dateignore,
//         //     updated_date: Dateignore
//         // }
//     }
// }
module.exports = {
    tables: {
        Test: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String
        }
        // Testcase: {
        //     _id: GenType.Key(GenType.Uuid),
        //     shellclass_id: GenType.Key(GenType.Uuid),
        //     shellinstance_id: GenType.Key(GenType.Uuid),
        //     params: GenType.Object,
        //     created_date: GenType.Date('now'),            
        //     updated_date: GenType.Date('now'),
        //     status: GenType.Number    
        // }
        // ShellInstance: {
        //     _id: GenType.Key(GenType.Uuid),
        //     shellclass_id: GenType.Key(GenType.Uuid),
        //     input_data: GenType.Object,
        //     created_date: GenType.Date('now'),            
        //     updated_date: GenType.Date('now'),
        //     status: GenType.Number    
        // }
        // ShellClass: {
        //     _id: GenType.Key(GenType.Uuid),
        //     name: GenType.String,
        //     des: GenType.String(null),
        //     mano: GenType.String,
        //     yaml: GenType.String,
        //     input: GenType.Array({
        //         params: GenType.String,
        //         label: GenType.String,
        //         type: GenType.String,
        //         default: GenType.String,
        //         component: GenType.String
        //     }),
        //     testing: GenType.Object({
        //         tasks: GenType.Array,
        //         params: GenType.Array,
        //         testcases: GenType.Array
        //     }),
        //     created_date: GenType.Date('now'),            
        //     updated_date: GenType.Date('now'),
        //     status: GenType.Number,
        //     path: GenType.File({uploadDir: 'assets/shells/', multiples: false, "httpPath": "/shells/${filename}"})
        // }
        // ExecutingLogs: {
        //     _id: GenType.Key(GenType.Uuid),
        //     event_type: GenType.String,
        //     status: GenType.Number,
        //     title: GenType.String,
        //     shellclass_id: GenType.Key(GenType.Uuid),
        //     started_time: GenType.Date('now')
        // }
    },
    outdir: 'src'
};