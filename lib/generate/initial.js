const path = require('path');
module.exports = {
    tables: {
        log: {
            _id: GenType.Key(GenType.Uuid),
            project_id: GenType.Uuid,
            account_id: GenType.Uuid,
            data: GenType.Object,
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        }
    },
    outdir: 'src'
};