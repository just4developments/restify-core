const projectService = require('./project.service');
const rolesService = require('./role.service');
const configService = require('./config.service');
const cachedService = require('./cached.service');
const db = require('../db');

var main = async () => {        
    const dbo = await db.open(projectService.COLLECTION);
    const cached = await cachedService.open();
    try {
        const projects = await projectService.find({}, dbo);
        dbo.change(rolesService.COLLECTION);
        for(let p of projects) {
            const config = await configService.find({
                where: { project_id: p._id }
            }, dbo);
            const roles = await rolesService.find({
                where: { project_id: p._id }
            }, dbo);
            await configService.setCached(p._id, config, cached);
            await projectService.setCached(p._id, p, cached);
            await rolesService.setCached(p._id, roles, cached);
        }
    } finally {
        await cached.close();   
        await dbo.close();             
    }
};

main();