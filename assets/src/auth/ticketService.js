'use strict';

var CustomerFactory = require('mozu-node-sdk/clients/commerce/customer/customerAccount');


function findOrCreateCustomerIdByUserName(context, user) {
    var cf = new CustomerFactory({ context: context.apiContext });
    cf.context['user-claims'] = null;
    return cf.getAccounts({ pageSize: 1, filter: 'userName eq ' + user.email })
        .then(function(res) {
            if (res.items.length === 1 && res.items[0].id) {
                return res.items[0].id;
            }
        })
        .then(function(id) {
            if (id) {
                return id;
            }
            console.log('customer not found with username:  ' + user.email);
            console.log('begin create customerAccount');
            var nameParts = (user.name || 'user').split(' ');
            return cf.addAccount({
                emailAddress: user.email,
                firstName: nameParts[0],
                lastName: nameParts.length > 1 ? nameParts[1] : ' ',
                userName: user.email
            }).then(function(newCustomerAccount) {
                return newCustomerAccount.id;
            });

        });

}


function federatedLogin(context, user) {
    return findOrCreateCustomerIdByUserName(context, user)
        .then(function(customerId) {
            var config = {
                rememberUser: true,
                customerId: customerId
            };
            return new Promise(function(resolve, reject) {
                context.exec.loginUser(config, function(e) {
                    if (e) {
                        reject(e);
                    }
                    resolve(user);
                });

            });
        });
}

module.exports = {
    federatedLogin: federatedLogin,
    findOrCreateCustomerIdByUserName: findOrCreateCustomerIdByUserName
};