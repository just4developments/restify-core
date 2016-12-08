let restify = require('restify');
let path = require('path');

let utils = require('../utils');
let ShellClassService = require('../service/ShellClass.service');

/************************************
 ** CONTROLLER:   ShellClassController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 11/7/2016, 2:02:46 PM
 *************************************/

server.get('/ShellClass', utils.jsonHandler(), (req, res, next) => {
    let where = {};
    if(utils.has(req.query.status)) where.status = +req.query.status;
    return ShellClassService.find({ where: where, page: +req.query.page, recordsPerPage: +req.query.recordsPerPage, sortBy: {updatedDate: -1}}).then((rs) => {
        res.send(rs);
    }).catch(next);
});

server.get('/ShellClass/:_id', utils.jsonHandler(), (req, res, next) => {
    return ShellClassService.get(req.params._id).then((rs) => {
        res.send(rs);
    }).catch(next);
});

// server.post('/ShellClass/result/:executingLogId', utils.jsonHandler(), (req, res, next) => {
//     ShellClassService.updateResult(req.params.executingLogId, req.body).then((rs) => {        
//         res.send(rs); 
//     }).catch(next);
// });

// server.post('/ShellClass/execute/:id', utils.jsonHandler(), (req, res, next) => {
//     ShellClassService.execute(req.params.id, req.body).then((rs) => {
//        res.send(rs["#"]); 
//     }).catch(next);
// });

// server.post('/ShellClass/install/:id', utils.jsonHandler(), (req, res, next) => {
//     ShellClassService.install(req.params.id).then((rs) => {
//        res.send(rs); 
//     }).catch(next);
// });

// server.post('/ShellClass/upload/:id', utils.fileUploadHandler({
// 	"uploadDir": "assets/shells/",
// 	"multiples": false,
// 	"httpPath": "/shells/${filename}"
// }), (req, res, next) => {
//     ShellClassService.updateUploadingShell(req.params.id, req.file.shells).then((rs) => {
//         ShellClassService.install(req.params.id).then((rs) => {
//             res.send(rs); 
//         }).catch(next);
//     }).catch((err) => {
//         utils.deleteFile(utils.getAbsoluteUpload(req.file.shells, path.join(__dirname, '..', '..', 'assets', 'shells', '')));
//         next(err);
//     });
// });

server.opts('/ShellClass/upload', (req, res, next) => {
    res.end();    
});

server.post('/ShellClass', utils.fileUploadHandler({
	"uploadDir": "assets/shells/",
	"multiples": false,
	"httpPath": "/shells/${filename}"
}), (req, res, next) => {
    ShellClassService.insertUploadingShell(req.file.shells).then((resp) => {
        ShellClassService.uploadPlugin(resp.ops[0]).then((rs) => {
            res.send({class: resp.ops[0], session: rs.SessionId});
        }).catch(next);        
    }).catch((err) => {
        utils.deleteFile(utils.getAbsoluteUpload(req.file.shells, path.join(__dirname, '..', '..', 'assets', 'shells', '')));
        next(err);
    });    
});

server.del('/ShellClass/:_id', utils.jsonHandler(), (req, res, next) => {
    ShellClassService.deletePlugin(req.params._id).then((rs) => {
        res.send(rs.SessionId);
    }).catch(next);
})