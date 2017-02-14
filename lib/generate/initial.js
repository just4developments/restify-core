const path = require('path');
module.exports = {
    tables: {
        project: {
            _id: GenType.Key(GenType.Uuid),
            cloud_ip: GenType.String,
            cloud_user: GenType.String,
            cloud_password: GenType.String(null),
            cloud_keypair: GenType.String(null),
            cloud_type: GenType.String,
            options: GenType.Object(null),
            created_at: GenType.Date('auto-insert'),
            updated_at: GenType.Date('auto-insert|auto-update')
        }
    },
    outdir: 'src'
};