let restify = require('restify');
let fs = require('fs');
let path = require('path');

let BroadcastService = require('./src/service/Broadcast.service');

/************************************
 ** SERVER LISTENER
 ** 
 *************************************/

global.appconfig = require('./src/appconfig');
Error.prototype.manual = (status) => {
    this.status = status;
    return this;
};

global.server = restify.createServer();

server.use(restify.queryParser());
server.use(restify.acceptParser(server.acceptable));
// server.use(restify.dateParser());
// server.use(restify.jsonp());
// server.use(restify.gzipResponse());
// server.use(restify.bodyParser());
// server.use(restify.requestExpiry());
// server.use(restify.conditionalRequest());
// server.use(restify.CORS());

server.get(/\/shells\/?.*/, (req, res, next) => {
    let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    clientIP = clientIP.replace('::ffff:', '');
    if(appconfig.static.shells.whiteList && appconfig.static.shells.whiteList.indexOf(clientIP) === -1){
        return next(new restify.ForbiddenError('Not allowed to access this url'));
    }
    next();
}, restify.serveStatic({
  directory: './assets'
}));

server.pre(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    // res.setHeader("Access-Control-Allow-Credentials", true);
    return next();
});

fs.readdir(path.join(__dirname, 'src', 'controller'), function (err, files) {
    if (err) return console.error(err);
    for (var file of files) {
        require(`./src/controller/${file}`);
    }
});

server.on('InternalServer', function (req, res, err, cb) {
    console.log(err);
    return cb();
});

global.ioer = {};
let io = require('socket.io')(server.server);
io.sockets.on('connection', function (socket) {
    socket.emit('connected', undefined);
    socket.on('bind', function (sessionId) {
        socket.cuzId = sessionId;
        global.ioer[sessionId] = socket;
    });
});

BroadcastService.listenFromRabQ(appconfig.rabbit.api.channelName, appconfig.rabbit.api.channelType).then(() => {
    console.log('RabitQ Listened');
}).catch((err) => {
    console.error(err);
});

server.listen(appconfig.listen, () => {
    console.log("Server is running at %d", appconfig.listen);
});