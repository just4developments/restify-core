var _ = require('lodash');
var a = require('./lib/core/utils.js');
var b = _.extend(a, {rd: 10});
console.log(a === b);