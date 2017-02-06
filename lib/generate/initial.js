const path = require('path');
module.exports = {
    tables: {
        project: {
            _id: GenType.Key(GenType.Uuid),
            key: GenType.Uuid,
            name: GenType.String,
            status: GenType.Number,
            config: GenType.Object({
                single_mode: GenType.Boolean,
                session_expired: GenType.Number
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
            project_id: GenType.Uuid,
            role_ids: GenType.Array,
            app: GenType.String,
            username: GenType.String,
            password: GenType.String,
            status: GenType.Number(0),
            recover_by: GenType.String,
            more: GenType.Object,
            token: GenType.Uuid('db', null),
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        }
    },
    outdir: 'src'
};