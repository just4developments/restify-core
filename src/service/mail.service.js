const restify = require('restify');
const path = require('path');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
const microService = require('./micro.service');

/************************************
 ** SERVICE:      mailController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/7/2017, 3:31:14 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "mail",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	STATUS: {
		PENDING: 0,
		DONE: 1,
		FAILED: -1
	},
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);
				item.title = utils.valid('title', item.title, String);
				item.content = utils.valid('content', item.content, String);
				item.html = utils.valid('html', item.html, Boolean, false);
				item.mail_config = utils.valid('mail config', item.mail_config, Object);
				item.from = utils.valid('from', item.from, Object);
				item.from.email = utils.valid('from.email', item.from.email, String);
				item.from.name = utils.valid('from.name', item.from.name, String, item.from.email);

				item.to = utils.valid('to', item.to, Array);
                if(item.attachments) {
                    item.attachments = utils.valid('attachments', item.attachments, Array);
                    item.attachments.forEach((itemi, i) => {
                        itemi.name = utils.valid('attachment.name', itemi.name, String);
                        itemi.path = utils.valid('attachment.path', itemi.path, String);
                    });
                }
				if(utils.has(item.cc)) item.cc = utils.valid('cc', item.cc, Array);
				if(utils.has(item.bcc)) item.bcc = utils.valid('bcc', item.bcc, Array);
				item.trying_time = utils.valid('trying_time', item.trying_time, Number);
				item.status = utils.valid('status', item.status, Number, 0);
				item.created_at = new Date();
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.UPDATE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				if (utils.has(item.trying_time)) item.trying_time = utils.valid('trying_time', item.trying_time, Number);
				if (utils.has(item.status)) item.status = utils.valid('status', item.status, Number);
				item.updated_at = new Date();

				break;
			case exports.VALIDATE.GET:
				item._id = utils.valid('_id', item._id, db.Uuid);
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);

				break;
			case exports.VALIDATE.DELETE:
				item._id = utils.valid('_id', item._id, db.Uuid);
				item.project_id = utils.valid('project_id', item.project_id, db.Uuid);

				break;
			case exports.VALIDATE.FIND:

				break;
		}
		return item;
	},

	async schedule(){
		const listEmail = await exports.find({
			where: {
				status: exports.STATUS.PENDING
			},
			sort: {
				updated_at: 1
			}	
		});
		if(listEmail.length > 0) {	
			const dbo = await db.open(exports.COLLECTION);
			for(let e of listEmail){
				if(!e.mail_config) { 
					e.status = exports.STATUS.FAILED;
					e.msg = 'Could not found mail config';					
				}else {					
					try {
						await exports.send(e);
						e.status = exports.STATUS.DONE;
					}catch(err) {
						e.trying_time--;
						if(e.trying_time === 0) e.status = exports.STATUS.FAILED;
						e.msg = err.toString();
					}					
				}
				await exports.update(e, dbo);
			}
			await dbo.close();
		}
		setTimeout(exports.schedule, global.appconfig.app.timeout_scan_email);
	},
	
	async send(email){		
		return new Promise((resolve, reject) => {
			const nodemailer = require('nodemailer');
			email.mail_config.auth.pass = new Buffer(email.mail_config.auth.pass, 'base64').toString('utf8');
			const transporter = nodemailer.createTransport(email.mail_config);
			const mailOptions = {
				from: `"${email.from.name}" <${email.from.email}>`,
				to: email.to.join(', '),
				subject: email.title
			};
			if(email.attachments) {
				const path = require('path');
				mailOptions.attachments = [];
				for(let a of email.attachments){
					mailOptions.attachments.push({
						filename: a.name,
						path: path.join(__dirname, '..', '..', 'assets', a.path)
					});
				}
			}
			if(email.cc) mailOptions.cc = email.cc.join(', ');
			if(email.bcc) mailOptions.bcc = email.bcc.join(', ');
			if(email.html) mailOptions.html = email.content;
			else mailOptions.text = email.content;
			try {
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) return reject(error);
					resolve(info);
				});
			}catch(e){
				reject(e);
			}			
		});		
	},

	async find(fil = {}, dbo) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.get(_id, dboType);
		return rs;
	},

	async insert(item, config_name, auth, dbo) {
		const projectConfig = await microService.getConfig(auth, 'mail');			
		item.trying_time = projectConfig.trying_time;
		item.mail_config = projectConfig.accounts[config_name];

		item = await exports.validate(item, exports.VALIDATE.INSERT);		

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async update(item, dbo) {
		item = exports.validate(item, exports.VALIDATE.UPDATE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		const rs = await dbo.update(item, dboType);

		return rs;
	},

	async delete(_id, dbo) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dboType = dbo ? db.FAIL : db.DONE;
		dbo = dbo ? await dbo.change(exports.COLLECTION) : await db.open(exports.COLLECTION);
		try {
			const mail = await dbo.get(_id, db.FAIL);
			if(mail.status !== exports.STATUS.PENDING) throw new restify.PreconditionFailedError("Could not delete email with status != pending");
			const rs = await dbo.delete(_id, db.FAIL);
		} finally {
			if(dboType === db.DONE) await dbo.close();
		}

		return rs;
	}

}