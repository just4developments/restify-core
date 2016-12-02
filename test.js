var async = require('async');
let a = {b: 10};
async.series([((a, cb)=>{
    a.b++;
    cb(null, a);
}).bind(null, a), ((a, cb)=>{
    a.b++;
    a = null;
    cb(null, a);
}).bind(null, a)], (err, vl) => {
    console.log(a);
})