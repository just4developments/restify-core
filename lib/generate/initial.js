const path = require('path');
module.exports = {
    tables: {
        Project: {
            _id: GenType.Key(GenType.Uuid),
            key: GenType.Uuid,
            name: GenType.String,
            status: GenType.Number,
            created_at: GenType.Date('auto-create'),
            updated_at: GenType.Date('auto-create|auto-update')
            // images: GenType.File({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")})
        }
    },
    outdir: 'src'
};