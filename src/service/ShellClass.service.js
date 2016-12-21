const restify = require('restify');
const path = require('path');
const AdmZip = require('adm-zip');
const _ = require('lodash');

const db = require('../db');
const utils = require('../utils');
/************************************
 ** SERVICE:      ShellClassController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/19/2016, 2:52:57 PM
 *************************************/

exports = module.exports = {
	COLLECTION: "ShellClass",
	VALIDATE: {
		INSERT: 0,
		UPDATE: 1,
		GET: 2,
		DELETE: 3,
		FIND: 4,
	},
	STATE: {
        UPLOADING: 0,
        UPLOADED: 1,
        UPLOAD_FAILED: -1,
        DELETING: 2,
        DELETED: 3,
        DELETE_FAILED: 1
    },
	validate(item, action) {
		let msg;
		switch (action) {
			case exports.VALIDATE.INSERT:
				item._id = db.uuid();
				item.name = utils.valid('name', item.name, String);
				item.mano = utils.valid('mano', item.mano, String);
				item.yaml = utils.valid('yaml', item.yaml, String);
				item.path = utils.valid('path', item.path, String);
				item.input = utils.valid('input', item.input, Array);
				item.input.forEach((itemi, i) => {
					item.input[i].param = utils.valid('param', item.input[i].param, String);
					item.input[i].label = utils.valid('label', item.input[i].label, String);
					item.input[i].default = utils.valid('default', item.input[i].default, String);
					item.input[i].component = utils.valid('component', item.input[i].component, String);
				});
				item.testing = utils.valid('testing', item.testing, Object);
				if (item.testing) {
					item.testing.tasks = utils.valid('tasks', item.testing.tasks, Array);
					item.testing.parameters = utils.valid('parameters', item.testing.parameters, Array);
					item.testing.testcases = utils.valid('testcases', item.testing.testcases, Array);
				}
				item.created_date = new Date();
				item.updated_date = new Date();
				item.status = exports.STATE.UPLOADING;				
				break;
			case exports.VALIDATE.UPDATE:
				item._id = db.uuid(utils.valid('_id', item._id, [String, db.Uuid]));
				item.name = utils.valid('name', item.name, String);
				item.mano = utils.valid('mano', item.mano, String);
				item.yaml = utils.valid('yaml', item.yaml, String);
				item.input = utils.valid('input', item.input, Array);
				item.input.forEach((itemi, i) => {
					item.input[i].param = utils.valid('param', item.input[i].param, String);
					item.input[i].label = utils.valid('label', item.input[i].label, String);
					item.input[i].type = utils.valid('type', item.input[i].type, String);
					item.input[i].default = utils.valid('default', item.input[i].default, String);
					item.input[i].component = utils.valid('component', item.input[i].component, String);
				});
				item.testing = utils.valid('testing', item.testing, Object);
				if (item.testing) {
					item.testing.tasks = utils.valid('tasks', item.testing.tasks, Array);
					item.testing.param = utils.valid('param', item.testing.param, Array);
					item.testing.testcases = utils.valid('testcases', item.testing.testcases, Array);
				}
				item.created_date = utils.valid('created_date', item.created_date, Date, new Date());
				item.updated_date = utils.valid('updated_date', item.updated_date, Date, new Date());
				item.status = utils.valid('status', item.status, Number);
				item.path = utils.valid('path', item.path, String);

				break;
			case exports.VALIDATE.GET:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.DELETE:
				item = db.uuid(utils.valid('_id', item, [String, db.Uuid]));

				break;
			case exports.VALIDATE.FIND:


				break;
		}
		return item;
	},

	async find(fil = {}, dboReuse) {
		fil = exports.validate(fil, exports.VALIDATE.FIND);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.find(fil, dboType);
		return rs;
	},

	async get(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.GET);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.get(_id, dboType);
		return rs;
	},

	handleShellFile(inputFile){
        var zip = new AdmZip(inputFile);
        let hasMeta = false;
        let hasSh = false;
        let meta;
        zip.getEntries().forEach(function (zipEntry) {
            if(zipEntry.isDirectory){
                zip.getEntries(zipEntry.entryName).forEach(function (zipEntry) {
                    if (/config\.json$/.test(zipEntry.entryName)) {
                        hasMeta = true;
                        meta = zipEntry.getData().toString();
                        meta = JSON.parse(meta);
                        // utils.validateJson(meta, require('../validation/ShellClass.validation'));
                    }
                });
            }
            if (!hasMeta && /config\.json$/.test(zipEntry.entryName)) {
                hasMeta = true;
                meta = zipEntry.getData().toString();
                meta = JSON.parse(meta);
                // utils.validateJson(meta, require('../validation/ShellClass.validation'));
            }
        });
        if (!hasMeta) throw new Error('Need file config.json in plugin');
        return meta;
    },

	async uploadPlugin(newShell){
		const meta = exports.handleShellFile(path.join(__dirname, '..', '..', 'assets', newShell));
        const shellMeta = _.extend(meta, {
            path: newShell,
            created_date: new Date(),
            updated_date: new Date(),
            status: exports.STATE.UPLOADING
        });
		const shellClass = await exports.insert(shellMeta);
		let ExecutingLogs = require('./ExecutingLogs.service');
		let rabSession = await ExecutingLogs.insert({
			event_type: ExecutingLogs.EVENT_TYPE.UPLOAD_PLUGIN,
			status: ExecutingLogs.STATUS.RUNNING,
			title: shellClass.name,
			shellclass_id: shellClass._id,
			started_time: new Date()
		});
		let data = {
			SessionId: rabSession._id.toString(),
			Command: appconfig.rabbit.channel.uploadPlugin.cmd,
			Params: {
				cloud_ip: appconfig.rabbit.cloud_ip,
				blueprint_id: shellClass.name,
				archive_file_link: 'https://doc-0o-6s-docs.googleusercontent.com/docs/securesc/u9vbanucnqtv8v4mjno65fgpnhpqog7g/i1a7o85dqb3i63duurjal42qshhctot3/1482213600000/10869540118886159925/10869540118886159925/0B3cSCCgAKiwHYjQ0VkRBYnVPaVU?e=download', //`${appconfig.staticUrl}${shellClass.path}`,
				blueprint_file_name: shellClass.yaml
			},
			From: appconfig.rabbit.api.queueName
		};                    
		let BroadcastService = require('./Broadcast.service');
		await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.uploadPlugin.queueName, data);

		return {
			class: shellClass,
			session: data.SessionId
		};
	},

	async deletePlugin(_id) {
        const ShellInstanceService = require('./ShellInstance.service');
        const count = await ShellInstanceService.getInstanceAvail(_id);
		if(count > 0) throw new restify.PreconditionFailedError(`Need remove ${count} instance${count > 1 ? 's' : ''} in this plugin before deleting`);
		const shellClass = await exports.get(_id);
		exports.updateStatus({
			_id: shellClass._id.toString(),
			status: exports.STATE.DELETING
		});
		const ExecutingLogs = require('./ExecutingLogs.service');
		const rabSession = await ExecutingLogs.insert({
			event_type: ExecutingLogs.EVENT_TYPE.DELETE_PLUGIN,
			status: ExecutingLogs.STATUS.RUNNING,
			title: shellClass.name,
			shellclass_id: shellClass._id,
			started_time: new Date()
		});
		const data = {
			SessionId: rabSession._id.toString(),
			Command: appconfig.rabbit.channel.deletePlugin.cmd,
			Params: {
				cloud_ip: appconfig.rabbit.cloud_ip,
				blueprint_id: shellClass.name
			},
			From: appconfig.rabbit.api.queueName
		};                    
		const BroadcastService = require('./Broadcast.service');
		await BroadcastService.broadcastToRabQ(appconfig.rabbit.channel.deletePlugin.queueName, data);			
		return data.SessionId;
    },

	async insert(item, dboReuse) {
		item = exports.validate(item, exports.VALIDATE.INSERT);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.insert(item, dboType);
		return rs;
	},

	async updateStatus({_id, status}, dboReuse){
		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.update({_id, status}, dboType);
	},

	async update(item, dboReuse) {
		try {
			_id = exports.validate(item, exports.VALIDATE.UPDATE);

			const dbo = dboReuse || await db.open(exports.COLLECTION);
			const oldItem = await dbo.get(item._id, db.FAIL);
			const dboType = dboReuse ? db.FAIL : db.DONE;
			const rs = await dbo.update(item, dboType);

			utils.deleteFile(utils.getAbsoluteUpload(oldItem.path, path.join(__dirname, '..', '..', 'assets', 'shells', '')), undefined);

			return rs;
		} catch (err) {
			utils.deleteFile(utils.getAbsoluteUpload(item.path, path.join(__dirname, '..', '..', 'assets', 'shells', '')), undefined);

			throw err;
		}
	},

	async delete(_id, dboReuse) {
		_id = exports.validate(_id, exports.VALIDATE.DELETE);

		const dbo = dboReuse || await db.open(exports.COLLECTION);
		const item = await dbo.get(_id, db.FAIL);
		const dboType = dboReuse ? db.FAIL : db.DONE;
		const rs = await dbo.delete(_id, dboType);

		utils.deleteFile(utils.getAbsoluteUpload(item.path, path.join(__dirname, '..', '..', 'assets', 'shells', '')), undefined);

		return rs;
	}

}