const restify = require('restify');
const path = require('path');
const _ = require('lodash');
const unirest = require('unirest');

const db = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ExpensiveNoteController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:32:25 PM
 *************************************/
let createUser = (email) => {
    return new Promise((resolve, reject)=>{
        var Request = unirest
        .post(`${global.appconfig.auth.url}/Login`)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json', pj: '586b55c48a1b181fa80d39a5', app: 'facebook|google'})
        .send({
            username: email,
            status: 1,
            roles: ['586b55c48a1b181fa80d39a6']
        })
        .end((resp) => {
            switch (resp.code) {
                case 200:                    
                    return resolve(resp.headers.token);
            }
            reject(resp);
        });
    });    
}
let addDataForUser = async (data) => {
    db.url = 'mongodb://localhost:27017/sochitieu';
    let dbo = await db.open('ExpensiveNote');
    await dbo.insert(data);
}
exports = module.exports = async (email) => {
    if(!email) return;
    const users = [];
    db.url = 'mongodb://localhost:27017/savemoney';
    let dbo = await db.open('Spending');
    try{                
        let rawtoken = await createUser(email);
        let [pj, userId, token] = rawtoken.split('-');
        dbo.collection = 'Wallet';
        let wallets = await dbo.find({
            where: {
                email: email,
                removed: 0
            }
        }, db.FAIL);
        if(wallets.length === 0) continue;
        let tmpWallet = {};        
        wallets = wallets.map((e) => {
            tmpWallet[e.ID] = e._id;
            e.created_at = new Date(e.createdAt);
            e.updated_at = new Date(e.updatedAt);
            e.type = e.avail;
            delete e.avail;
            delete e.email;
            delete e.createdAt;
            delete e.updatedAt;
            delete e.is_sync;
            delete e.removed;
            delete e.objectId;
            delete e.ID;
            delete e.server_id;
            return e; 
        });
        dbo.collection = 'TypeSpending';
        let tmpTypeSpending = {};     
        let typeSpendings = await dbo.find({
            where: {
                email: email,
                removed: 0
            },
            sort: {
                parent_id: 1
            }
        }, db.FAIL);
        if(typeSpendings.length === 0) continue;
        typeSpendings = typeSpendings.map((e) => {
            tmpTypeSpending[e.ID] = e._id;
            e.created_at = new Date(e.createdAt);
            e.updated_at = new Date(e.updatedAt);
            e.uname = utils.toUnsign(e.name);
            e.parent_id = (!e.parent_id || e.parent_id.length === 0) ? null : tmpTypeSpending[e.parent_id];
            delete e.email;
            delete e.createdAt;
            delete e.updatedAt;
            delete e.is_sync;
            delete e.removed;
            delete e.objectId;
            delete e.ID;
            delete e.server_id;
            return e; 
        });
        dbo.collection = 'Spending';
        let spendings = await dbo.find({
            where: {
                email: email,
                removed: 0
            }
        }, db.FAIL);
        spendings = spendings.map((e) => {
            e.created_at = new Date(e.createdAt);
            e.updated_at = new Date(e.updatedAt);
            e.is_monitor = e.is_report;
            e.input_date = new Date(e.created_date);
            e.date = e.input_date.getDate();
            e.month = e.input_date.getMonth();
            e.year = e.input_date.getFullYear();
            e.udes = utils.toUnsign(e.des);
            let tmp = e.type_spending_id;
            e.type_spending_id = tmpTypeSpending[e.type_spending_id];
            e.wallet_id = tmpWallet[e.wallet_id];
            if(!e.type_spending_id || !e.wallet_id) {
                return null;
            }
            delete e.created_day;
            delete e.created_date;
            delete e.created_month;
            delete e.created_year;
            delete e.is_report;
            delete e.email;
            delete e.createdAt;
            delete e.updatedAt;
            delete e.is_sync;
            delete e.removed;
            delete e.objectId;
            delete e.ID;
            delete e.server_id;
            return e; 
        }).filter((e) => {
            return e !== null;
        });
        if(spendings.length === 0) continue;
        let User = {
            user_id: db.uuid(userId),
            spendings,
            wallets,
            type_spendings: typeSpendings,            
        };
        users.push(User);
        await addDataForUser(User);
    }finally{
        await dbo.close();
    }    
    // require('fs').writeFileSync('./data.json', JSON.stringify(users, null, '\t'), 'utf-8');
    console.log('done');
}