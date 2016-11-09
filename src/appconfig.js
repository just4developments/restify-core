module.exports = {
    listen: 8080,
    staticUrl: 'http://192.168.0.111:8080',
    db: {
        url: 'mongodb://localhost:27017/validium'
    },
    rabbit: {
        url: 'amqp://192.168.0.140',
        timeout: 500,
        installing: {
            channelName: 'installer',
            channelType: 'fanout'
        },
        executing: {
            channelType: 'fanout'
        }
    },
    static: {
        shells: {
            whiteList: undefined //['192.168.0.11'] // IP can download to install shell scripts
        }
    },
    oauth: {
        clientId: 'test1',
        clientSecret: '3A@$us3D_udrAphU'
    }
}