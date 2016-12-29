const restify = require('restify');
const path = require('path');
const fs = require('fs');

const utils = require('../utils');

/************************************
 ** CONTROLLER:   AccountController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/16/2016, 4:04:45 PM
 *************************************/

server.get('/Manager', utils.jsonHandler(), async(req, res, next) => {
    res.header('Content-Type', 'text/html');
	res.end(fs.readFileSync(path.join(__dirname, 'html', 'index.html')));
});