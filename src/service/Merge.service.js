const restify = require('restify');
const path = require('path');
const _ = require('lodash');
const unirest = require('unirest');

const db0 = require('../db');
const utils = require('../utils');

/************************************
 ** SERVICE:      ExpensiveNoteController
 ** AUTHOR:       Unknown
 ** CREATED DATE: 12/30/2016, 11:32:25 PM
 *************************************/

let addDataForUser = async (db, data) => {
    let dbo = await db.open('ExpensiveNote', 'mongodb://localhost:27017/sochitieu');
    await dbo.insert(data);
}
exports = module.exports = async (email, auth) => {
    if(!email) return;
    const users = [];
    const dbSochitieu = _.cloneDeep(db0);
    const db = _.cloneDeep(db0);
    let dbo = await db.open('Spending', 'mongodb://localhost:27017/savemoney');
    try{
        let wallets = await dbo.find({
            where: {
                email: email,
                removed: 0
            }
        }, {collection: 'Wallet', close: db.FAIL});
        let tmpWallet = {};        
        if(wallets.length !== 0) {            
            wallets = wallets.map((e) => {
                tmpWallet[e.ID] = _.clone(e);
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
        }
        let tmpTypeSpending = {};     
        let typeSpendings = await dbo.find({
            where: {
                email: email,
                removed: 0
            },
            sort: {
                parent_id: 1
            }
        }, {collection: 'TypeSpending', close: db.FAIL});
        if(typeSpendings.length !== 0) {
            typeSpendings = typeSpendings.map((e) => {
                tmpTypeSpending[e.ID] = _.clone(e);
                e.created_at = new Date(e.createdAt);
                e.updated_at = new Date(e.updatedAt);
                e.uname = utils.toUnsign(e.name);
                e.parent_id = (!e.parent_id || e.parent_id.length === 0 || !tmpTypeSpending[e.parent_id]) ? null : tmpTypeSpending[e.parent_id]._id;
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
        }
        let spendings = await dbo.find({
            where: {
                email: email,
                removed: 0
            },
            sort: {
                input_date: -1
            }
        }, {collection: 'Spending', close: db.FAIL});
        let tmp = [];
        if(spendings.length !== 0) {
            spendings = spendings.map((e) => {                
                let typeSpending = tmpTypeSpending[e.type_spending_id];
                let wallet = tmpWallet[e.wallet_id];                
                if(!typeSpending || !wallet) return null;
                e.created_at = new Date(e.createdAt);
                e.updated_at = new Date(e.updatedAt);
                e.input_date = new Date(e.created_date);                                
                e.date = e.input_date.getDate();
                e.month = e.input_date.getMonth();
                e.year = e.input_date.getFullYear();
                e.udes = e.des ? utils.toUnsign(e.des) : null;
                e.type_spending_id = typeSpending._id;
                e.wallet_id = wallet._id;
                e.sign_money = e.is_report ? (e.money * e.type) : 0;
                delete e.is_report;
                delete e.created_day;
                delete e.created_date;
                delete e.created_month;
                delete e.created_year;
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
        }
        if(spendings.length !== 0 || wallets.length !== 0 || typeSpendings.length !== 0) {
            let User = {
                user_id: db.uuid(auth.accountId),
                spendings,
                wallets,
                type_spendings: typeSpendings,            
            };
            users.push(User);
            await addDataForUser(dbSochitieu, User);
            return true;
        }
    }finally{
        await dbo.close();
    }
    return false;
}