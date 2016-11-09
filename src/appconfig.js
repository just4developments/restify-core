global.appconfig = {
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
    staticUrl: 'http://192.168.0.111:8080'
}