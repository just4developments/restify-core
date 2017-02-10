var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var fs = require('fs');
var compression = require('compression');

// var isDev = process.argv.includes('dev');

app.use(compression({
	threshold: 0
}));
app.use(express.static('dist', {
	maxage: '1d'
}));

var rconfig = require('./route');
for (var r in rconfig) {
	app.get(r, function (r, req, res) {
		var file = __dirname + '/dist/' + rconfig[r];
		res.sendFile(file);
	}.bind(null, r));
}

http.createServer(app).listen(4002);

console.log(`Server is running on http: 4002`);