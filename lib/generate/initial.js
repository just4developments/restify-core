const path = require('path');

module.exports = {
    tables: {
        User: {
            id: Key(Number, true), // true: overide uuid in db.js to manual identity key, false: auto increment
            name: String,
            age: Number,
            birthday: Date,
            avatar: FileUpload({uploadDir: 'assets/images/', returnPath: '/assets/images/'})
        }
    },
    outdir: path.join(__dirname, '..', '..', 'src')
}