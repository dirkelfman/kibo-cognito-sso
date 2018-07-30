'use strict';
var ActionInstaller = require('mozu-action-helpers/installers/actions');

module.exports = function(context, callback) {
    var installer = new ActionInstaller({ context: context.apiContext });
    installer.enableActions(context).then(callback.bind(null, null), callback);
};