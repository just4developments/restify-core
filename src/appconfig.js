module.exports = {
    listen: 9600,
    db: {
        url: 'mongodb://localhost:27017/oauthv2'
    },
    auth: {
        url: 'http://localhost:9600'
    },
    cache: {
        redis: {
            host: 'localhost',
            port: 6379,
            opts: {}
        }
    },
    app: {
        rootProjectId: '589c3cd29971853aa803b264',
        imageResize: {
			product: [
                {w: -1000 }, // Auto resize origin when width > 1000. If width < 1000 do nothing
                {w: 32, h: 32, ext: 'thumb'},
                {w: 224, h: 200, ext: 'list.pc'},
                {w: 358, h: 200, ext: 'list.tab'},
                {w: 270, h: 200, ext: 'list.mob'}
			]
        }
    }
}