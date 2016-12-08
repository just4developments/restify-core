const path = require('path');

module.exports = {
    tables: {
        test: {
            _id: GenType.Key(GenType.String),
            name: GenType.String("Unknown"),
            age: GenType.Number(20),
            date: GenType.Date('now'),
            obj: GenType.Object({class: 'test'}),
            arr: GenType.Array([1,2,3])
            // images: GenType.File({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
            // avatar: GenType.File({uploadDir: 'assets/avatar/', multiples: false, "httpPath": "/avatar/${filename}", "resize": Native("global.appconfig.app.imageResize.avatar")})
        }
    },
    outdir: 'src'
};