module.exports = {
    listen: 8080,
    staticUrl: 'http://10.64.0.168:8080',
    db: {
        url: 'mongodb://localhost:27017/validium'
    },
    rabbit: {        
        url: 'amqp://10.64.0.168',
        closeTimeout: 500,
        toWebTimeout: 2000,
        api: {
            queueName: 'api6'            
        },
        log: {
            queueName: 'log'            
        },
        channel : {
            uploadPlugin: {                
                cmd: "upload_plugin",
                queueName: 'vnf_onboarding'
            },
            deletePlugin: {                
                cmd: "delete_plugin",
                queueName: 'vnf_onboarding'
            },
            createInstance: {                
                cmd: 'create_deployment',
                queueName: 'vnf_onboarding'
            },
            deleteInstance: {                
                cmd: 'delete_deployment',
                queueName: 'vnf_onboarding'
            },
            deployInstance: {                
                cmd: 'install_deployment',
                queueName: 'vnf_onboarding'
            },
            undeployInstance: {                
                cmd: 'uninstall_deployment',
                queueName: 'vnf_onboarding'
            },
            getInfor: {
                cmd: 'get_info',
                queueName: 'administrator'
            },
            runTesting: {
                cmd: 'run_tasks',
                queueName: 'benchmark'
            }
        },
        cloud_ip: '10.64.0.162'
    },
    static: {
        shells: {
            whiteList: undefined //['192.168.0.11'] // IP can download to install shell scripts
        }
    }
}