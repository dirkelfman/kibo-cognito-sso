'use strict';
var tokenValidator = require('../../auth/cognitoTokenValidator');
var ticketService = require('../../auth/ticketService');

module.exports = function(context, callback) {

    var body = context.request.body;
    if (!body && !body.accessToken) {
        return callback('missing accessToken in body');
    }

    tokenValidator.getIdentity(context.configuration, body.accessToken)
        .then(function(userIdentity) {
            return ticketService.federatedLogin(context, userIdentity);
        })
        .then(function() {
            context.response.body = { message: 'success' };
            return context.response.end();
        })
        .catch(function(e) {
            return callback(e);
        });

};