var restify = require('restify'),
    fs = require('fs'),
    path = require('path');

global.server = restify.createServer({
    name: 'Name',
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());

server.on('InternalServer', function (req, res, err, cb) {
  console.log(err);
  return cb();
});

//server.use(restify.bodyParser({// maxBodySize: 0,mapParams: true,mapFiles: true,overrideParams: false,multipartHandler: function (part) {part.on('data', function (data) {/* do something with the multipart data */});},multipartFileHandler: function (part) {part.on('data', function (data) {/* do something with the multipart file data */});},keepExtensions: true,uploadDir: path.join(__dirname),multiples: true,hash: 'sha1'}));

fs.readdir(path.join(__dirname, 'src', 'controller'), function (err, files) {
    if (err) return console.error(err);
    for (var file of files) {
        require(`./src/controller/${file}`);
    }
});

server.listen(8080, () => {
    console.log("Server is running at 8080");
});