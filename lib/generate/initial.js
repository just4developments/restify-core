const path = require('path');
module.exports = {
    tables: {
        ExpensiveNote: {
            _id: GenType.Key(GenType.Uuid),
            user_id: GenType.Uuid,
            wallets: GenType.Array({
                _id: GenType.Key(GenType.Uuid),
                name: GenType.String,
                money: GenType.Number(0),
                type: GenType.Number
            }),
            type_spendings: GenType.Array({
                _id: GenType.Key(GenType.Uuid),
                name: GenType.String,
                icon: GenType.String,
                type: GenType.Number,
                parent_id: GenType.Uuid('db', null)
            }),
            spendings: GenType.Array(),

            // name: GenType.String(null),
            // age: GenType.Number(null),
            // date: GenType.Date(null),
            // bol: GenType.Boolean(null),
            // obj: GenType.Object({
            //     class: GenType.String,
            //     num: GenType.Number,
            //     obj0: GenType.Object({
            //         objName: GenType.String,
            //         objAge: GenType.Number,
            //         test: GenType.Object({
            //             testName: GenType.String,
            //             testAge: GenType.Number(null),
            //         })
            //     })
            // }, {class: 'test', num: 10}),
            // arr: GenType.Array({
            //     class: GenType.String,
            //     num: GenType.Number,
            //     arr0: GenType.Array({
            //        arr0Name: GenType.String 
            //     })
            // }, [1,2,3]),
            // images: GenType.File({uploadDir: 'assets/images/', multiples: true, "httpPath": "/images/${filename}", "resize": Native("global.appconfig.app.imageResize.product")}),
            // avatar: GenType.File({uploadDir: 'assets/avatar/', multiples: false, "httpPath": "/avatar/${filename}", "resize": Native("global.appconfig.app.imageResize.avatar")})
        }
    },
    outdir: 'src'
};