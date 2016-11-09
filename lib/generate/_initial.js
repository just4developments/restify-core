let path = require('path');

module.exports = {
    tables: {
        product: {
            _id: Key(String), // true: overide uuid in db.js to manual identity key, false: auto increment
            name: String,
            des: String,
            category_id: Number,
            createdDate: Date,
            images: FileUpload({uploadDir: 'assets/images/', returnPath: '/assets/images/', multiples: true}),
            details: Array
        }
    },
    outdir: path.join(__dirname, '..', '..', 'src')
}