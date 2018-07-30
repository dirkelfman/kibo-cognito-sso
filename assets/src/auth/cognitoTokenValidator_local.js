'use strict';
var jose = require('node-jose');
var https = require('https');
var jwkUrlFormat = 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json';
var jwKeys = null;


function helper() {

}
helper.validateTs = true;

helper.prototype.init = function(config) {
    this.config = config || {};
    this.validateConfig();
};

helper.prototype.validateConfig = function() {

    if (!this.config.userPoolId) {
        throw 'missing userPoolId in config';
    }
    if (!this.config.awsRegion) {
        throw 'missing awsRegion in config';
    }
};
helper.prototype.getJwks = function() {
    var me = this;
    return new Promise(function(resolve, reject) {
        if (jwKeys) {
            return resolve(jwKeys);
        }
        var jwkUrl = jwkUrlFormat
            .replace('{region}', me.config.awsRegion)
            .replace('{userPoolId}', me.config.userPoolId);

        https.get(jwkUrl, function(resp) {
            var data = '';

            // A chunk of data has been recieved.
            resp.on('data', function(chunk) {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', function() {
                try {
                    jwKeys = JSON.parse(data).keys;
                    return resolve(jwKeys);
                } catch (e) {
                    return reject(e);
                }

            }).on('error', function(err) {
                return reject(err);
            });
        });
    });
};
helper.prototype.getKid = function(token) {
    if (token.split('.').length !== 3) {
        throw 'invalid  token format';
    }
    var sections = token.split('.');
    // get the kid from the headers prior to verification
    var header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    return header.kid;

};
helper.prototype.isValid = function(token) {
    var me = this;
    return new Promise(function(resolve, reject) {
        var kid = '';
        try {
            kid = me.getKid(token);
        } catch (e) {
            return reject(e);
        }
        me.getJwks().then(function(keys) {
            var keyIndex = -1;
            for (var i = 0; i < keys.length; i++) {
                if (kid === keys[i].kid) {
                    keyIndex = i;
                    break;
                }
            }
            if (keyIndex === -1) {
                return reject('Public key not found in jwks.json');
            }
            return jose.JWK.asKey(keys[keyIndex]).
            then(function(result) {
                // verify the signature
                jose.JWS.createVerify(result).
                verify(token).
                then(function(result) {
                    // now we can use the claims
                    var claims = JSON.parse(result.payload);
                    // additionally we can verify the token expiration
                    var currentTs = Math.floor(new Date() / 1000);
                    if (helper.validateTs && currentTs > claims.exp) {
                        reject('Token is expired');
                    }
                    // and the Audience (use claims.client_id if verifying an access token)
                    if (me.config.appClientId && claims.aud !== me.config.appClientId) {
                        reject('Token was not issued for this audience');
                    }
                    return resolve(claims);
                }).
                catch(function() {
                    reject('Signature verification failed');
                });
            });

            // jose.JWK.asKey(keys[keyIndex]).
            // then(function(result) {
            //     return result.verify(token);
            // }).then(function(result) {
            //     // now we can use the claims
            //     var claims = JSON.parse(result.payload);
            //     // additionally we can verify the token expiration
            //     var currentTs = Math.floor(new Date() / 1000);
            //     if (currentTs > claims.exp) {
            //         return reject('Token is expired');
            //     }
            //     // and the Audience (use claims.client_id if verifying an access token)
            //     if (me.config.appClientId && claims.aud != me.config.appClientId) {
            //         return reject('Token was not issued for this audience');
            //     }

            //     return resolve(claims);
            // }).catch(function() {
            //     return reject('Signature verification failed');
            // });

        }).catch(function(e) {
            reject(e);
        });
    });
};


module.exports = helper;