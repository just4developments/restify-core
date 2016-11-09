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
            images: FileUpload({uploadDir: 'assets/images/', returnPath: '/images/', multiples: true}),
            details: Arrayable
        },
        category: {
            _id: Key(String),
            name: String
        }
    },
    outdir: path.join(__dirname, '..', '..', 'src')
}