const path = require('path');
module.exports = {
    tables: {
        project: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String,
            status: GenType.Number,
            config: GenType.Object({
                single_mode: GenType.Boolean,
                session_expired: GenType.Number
            });
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now')
        },
        roles: {
            _id: GenType.Key(GenType.Uuid),
            project_id: GenType.Uuid,
            name: GenType.String,
            api: GenType.Array({
                path: GenType.String,
                actions: GenType.Array
            })
        },
        accounts: {
            _id: GenType.Key(GenType.Uuid),
            app: GenType.String,
            project_id: GenType.Uuid,
            role_ids: GenType.Array,
            username: GenType.String,
            password: GenType.String,
            status: GenType.Number(0),
            recover_by: GenType.String,
            more: GenType.Object({
                fullname: GenType.String(null)
            }),
            token: GenType.Uuid('db', null),
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now')
        }
    },
    outdir: 'src'
};