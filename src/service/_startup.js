const mailService = require('./mail.service');

var main = async () => {        
    mailService.schedule();
};

main();