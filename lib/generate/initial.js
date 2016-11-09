let path = require('path');

module.exports = {
    tables: {
        ShellClass: {
            _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
            name: String,
            des: Stringable,
            category_id: Numberable,            
            input: Arrayable,
            output: Arrayable,
            content: String,
            target: String,
            createdDate: Dateignore,
            updatedDate: Dateignore
        },
        ExecutingLogs: {
            _id: Key(String),
            event_type: Number,
            status: Number,
            result: Object,            
            title: String,
            shellclass_id: String,
            started_time: Dateignore,
            finished_time: Dateable
        }
    },
    outdir: path.join(__dirname, '..', '..', 'src')
}