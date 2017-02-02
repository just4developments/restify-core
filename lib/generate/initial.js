const path = require('path');
module.exports = {
    tables: {
        Project: {
            _id: GenType.Key(GenType.Uuid),
            name: GenType.String,
            status: GenType.Number,
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now')
        },
        Roles: {
            _id: GenType.Key(GenType.Uuid),
            project_id: GenType.Uuid,
            name: GenType.String,
            api: GenType.Array({
                path: GenType.String,
                actions: GenType.Array
            })
        },
        Accounts: {
            _id: GenType.Key(GenType.Uuid),
            project_id: GenType.Uuid,
            role_ids: GenType.Array,
            username: GenType.String,
            password: GenType.String,
            status: GenType.Number(0),
            recover_by: GenType.String,
            more: GenType.Object({
                fullname: GenType.String(null)
            }),
            token: GenType.Uuid,
            created_at: GenType.Date('now'),
            updated_at: GenType.Date('now')
        }
    },
    outdir: 'src'
};