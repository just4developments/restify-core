let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;

/************************************
 ** DATABASE ADAPTER
 ** Note
 ** Implement for your database
 *************************************/

exports = module.exports = (tbl) => {
    return (db, isManualClose) => {
        let self = this;
        this.uuid = (id) => {
            
        };
        this.open = () => {
            return new Promise((resolve, reject) => {
                
            });
        };
        this.close = () => {
            
        };
        this.find = ({
            where,
            sortBy,
            page = 1,
            recordsPerPage = 20
        }) => {
            return new Promise((resolve, reject) => {
                
            });
        };
        this.get = (_id) => {
            return new Promise((resolve, reject) => {
                
            });
        };
        this.insert = (obj) => {
            return new Promise((resolve, reject) => {
                
            });
        };
        this.update = (obj) => {
            return new Promise((resolve, reject) => {
                
            });
        };
        this.delete = (_id) => {
            return new Promise((resolve, reject) => {
                
            });
        };
        return this;
    }
}