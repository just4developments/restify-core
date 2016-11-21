let restify = require('restify');
let fs = require('fs');
let path = require('path');

/************************************
 ** SERVER LISTENER
 ** 
 *************************************/

global.appconfig = require('./src/appconfig');

global.server = restify.createServer();

server.use(restify.queryParser());
// server.use(restify.acceptParser(server.acceptable));
// server.use(restify.dateParser());
// server.use(restify.jsonp());
// server.use(restify.gzipResponse());
// server.use(restify.bodyParser());
// server.use(restify.requestExpiry());
// server.use(restify.conditionalRequest());
// server.use(restify.CORS());
// server.use(restify.fullResponse());

server.get(/\/images\/?.*/, restify.serveStatic({
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

server.listen(appconfig.listen, () => {
    console.log("Server is running at %d", appconfig.listen);
});