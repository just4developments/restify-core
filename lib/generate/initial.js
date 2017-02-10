const path = require('path');
module.exports = {
    tables: {
        project: {
            _id: GenType.Key(GenType.Uuid),
            money: GenType.Number(0),
            input_date: GenType.Date,
            des: GenType.String,
            type_spending_id: GenType.Uuid,
            wallet_id: GenType.Uuid,
            is_bookmark: GenType.Boolean(false)
        },
        Wallet: {
            _id: GenType.Key(GenType.Uuid),
            icon: GenType.String,
            name: GenType.String,
            status: GenType.Number(0),  
            plugins: GenType.Object({
                oauthv2: GenType.Object({
                    _id: GenType.Uuid,
                    single_mode: GenType.Boolean,
                    session_expired: GenType.Number
                })
            }),          
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        },
        role: {
            _id: GenType.Key(GenType.Uuid),
            project_id: GenType.Uuid,
            name: GenType.String,
            api: GenType.Array({
                path: GenType.String,
                actions: GenType.Array
            }, []),
            web: GenType.Array({
                path: GenType.String,
                actions: GenType.Array
            }, []),
            mob: GenType.Array({
                path: GenType.String,
                actions: GenType.Array
            }, []),
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        },
        account: {
            _id: GenType.Key(GenType.Uuid),
            user_id: GenType.Uuid,
            wallets: GenType.Array({
                _id: GenType.Key(GenType.Uuid),
                icon: GenType.String,
                name: GenType.String,
                money: GenType.Number(0),
                type: GenType.Number(0)
            }),
            type_spendings: GenType.Array({
                _id: GenType.Key(GenType.Uuid),
                name: GenType.String,
                icon: GenType.String,
                type: GenType.Number,
                parent_id: GenType.Uuid('db', null)
            }),
            spendings: GenType.Array({
                _id: GenType.Key(GenType.Uuid),
                money: GenType.Number(0),
                input_date: GenType.Date,
                des: GenType.String,
                type_spending_id: GenType.Uuid,
                wallet_id: GenType.Uuid,
                is_bookmark: GenType.Boolean(false)
            }),

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