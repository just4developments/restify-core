module.exports = {
    listen: 9002,
    db: {
        url: 'mongodb://localhost:27017/mail'
    },
    auth: {
        url: 'http://localhost:9600'
    },
    app: {
        rabbit: {        
            url: 'amqp://10.64.0.168',
            connectTimeout: 20000,
            closeTimeout: 500,
            toWebTimeout: 2000
        }
    }
}