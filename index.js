require('./src/appconfig');
var restify = require('restify'),
    fs = require('fs'),
    path = require('path');

let server = restify.createServer({
    name: 'Name',
});
global.server = server;
    
server.use(restify.queryParser());
// server.use(restify.acceptParser(server.acceptable));
// server.use(restify.dateParser());
// server.use(restify.jsonp());
// server.use(restify.gzipResponse());
// server.use(restify.bodyParser());
// server.use(restify.requestExpiry());
// server.use(restify.conditionalRequest());
server.use(restify.CORS());
// server.use(restify.fullResponse());

server.on('InternalServer', function (req, res, err, cb) {
  console.log(err);
  return cb();
});

// server.pre(function (req, res, next) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
//     // res.setHeader("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
//     return next();
// });

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

fs.readdir(path.join(__dirname, 'src', 'controller'), function (err, files) {
    if (err) return console.error(err);
    for (var file of files) {
        require(`./src/controller/${file}`);
    }
});

// ##################WEB SOCKET#######################
global.ioer = {};
let io = require('socket.io')(server.server);
io.sockets.on('connection', function (socket) {
    socket.emit('connected', undefined);
    socket.on('bind', function (sessionId) {
        socket.cuzId = sessionId;
        global.ioer[sessionId] = socket;
    });
});

server.listen(8080, () => {
    console.log("Server is running at 8080");
});