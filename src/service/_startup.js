const projectService = require('./project.service');
const cachedService = require('./cached.service');
const db = require('../db');

var main = async () => {        
    const dbo = await db.open(projectService.COLLECTION);
    const cached = await cachedService.open();
    // await cached.clear();
    try {
        const projects = await projectService.find({}, dbo);
        for(let p of projects) {
            await projectService.refeshCached(p._id, p, cached, dbo);
        }
    } finally {
        await cached.close();   
        await dbo.close();             
    }
};

main();