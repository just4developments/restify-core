const restify = require('restify');
const path = require('path');
const _ = require('lodash');
const httpService = require('./http.service');

/************************************
 ** SERVICE:      projectService
 ** AUTHOR:       Unknown
 ** CREATED DATE: 2/7/2017, 3:31:14 PM
 *************************************/

exports = module.exports = {
    async checkAuthoriz(headers) {
        return await httpService.head(`${global.appconfig.auth.url}/authoriz`, {
            headers: headers
        })        
    },
    async getConfig(auth, pluginName) {
        const resp = await httpService.get(`${global.appconfig.auth.url}/project-config`, {
            headers: {
                token: auth.rawToken,
                path: '/project-config',
                actions: 'GET'
            },
            query: {
                plugin: pluginName
            }
        });
        if (resp.code === 200) return resolve(resp.body);
        reject(resp.code);
    }
}