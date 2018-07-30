'use strict';
var https = require('https');

function getIdentity(config, accessToken) {

    console.log(accessToken);
    return new Promise(function(resolve, reject) {
        var options = {
            host: config.userPoolDomain,
            path: '/oauth2/userInfo',
            port: '443',
            headers: { 'Authorization': 'Bearer ' + accessToken }
        };

        https.get(options, function(resp) {
            var data = '';
            // A chunk of data has been recieved.
            resp.on('data', function(chunk) {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', function() {
                if (resp.statusCode !== 200) {
                    return reject(data);
                }

                try {
                    return resolve(JSON.parse(data));
                } catch (e) {
                    return reject(e);
                }

            }).on('error', function(err) {
                return reject(err);
            });
        });
    });
}
module.exports = {
    getIdentity: getIdentity
};