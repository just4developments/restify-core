module.exports = {
    listen: 8080,
    staticUrl: 'http://10.64.255.105:8080',
    db: {
        url: 'mongodb://localhost:27017/validium'
    },
    rabbit: {        
        url: 'amqp://10.64.0.168',
        closeTimeout: 500,
        toWebTimeout: 2000,
        api: {
            exchange: 'logs',
            exchangeType: 'fanout',
            queueName: 'api6'            
        },
        channel : {
            uploadPlugin: {                
                cmd: "upload_plugin",
                exchange: 'logs',
                queueName: 'vnf_onboarding',
                exchangeType: 'fanout'
            },
            createInstance: {                
                cmd: 'create_deployment',
                exchange: 'logs',
                queueName: 'vnf_onboarding',
                exchangeType: 'fanout'
            },
            deployInstance: {                
                cmd: 'install_deployment',
                exchange: 'logs',
                queueName: 'vnf_onboarding',
                exchangeType: 'fanout'
            },
            getInfor: {
                cmd: 'get_info',
                exchange: 'logs',
                queueName: 'administrator',
                exchangeType: 'fanout'
            }
        },
        cloud_ip: '10.64.0.162'
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