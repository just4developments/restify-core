# Validium API
Provide APIs for uploading plugin, manage instances, testcase ...

## 1. How to run

Run on DEV server
```sh
    npm start
```

Run on PM2 (For Production)
```sh
    npm run pm2
```

## 2. Configuration

```javascript
    listen: 8080, // Port listening for API
    staticUrl: 'http://10.64.0.168:8080', // Prefix link for uploading file (ex: plugin)
    db: {
        url: 'mongodb://localhost:27017/validium' // Database url
    },
    rabbit: {        
        url: 'amqp://10.64.0.168', // Rabbit server
        closeTimeout: 500, // timeout to close connection in rabbit
        toWebTimeout: 2000, // timeout to send data to web via api queue
        api: {
            queueName: 'api6' // Rabbit queue name which interact with APIs (No realtime)
        },
        log: {
            queueName: 'log'    // Rabbit queue name which interact with Log progressing (Realtime)
        },
        channel : { // Declare command name and queue name which are used to interact with system
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
        cloud_ip: '10.64.0.162' // Fix cloud ip
    },
    static: {
        shells: {
            whiteList: undefined //['192.168.0.11'] // IP can download to install shell scripts
        }
    }
```