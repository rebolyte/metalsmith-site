var base = {
    "sitename": "My Metalsmith Site",
    "description": "A test to see how Metalsmith works.",
};
var prod = Object.assign(base, {
    "baseUrl": "http://james-irwin.com",
    'isDev': false
});
var dev = Object.assign(base, {
    "baseUrl": "http://localhost/metalsmith-site/build",
    'isDev': true
});

module.exports = function(args) {
    'use strict';
    var config = dev;

    args.forEach(function(val) {
        if (val === '--prod' || val === '-p') {
            config = prod; 
        } 
    });

    return config;

};