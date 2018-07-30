/**
 * This is a scaffold for unit tests for the custom function for
 * `http.storefront.routes`.
 * Modify the test conditions below. You may:
 *  - add special assertions for code actions from Simulator.assert
 *  - create a mock context with Simulator.context() and modify it
 *  - use and modify mock Mozu business objects from Simulator.fixtures
 *  - use Express to simulate request/response pairs
 */

'use strict';
var rewiremock = require('rewiremock');
var Simulator = require('mozu-action-simulator');
var assert = Simulator.assert;

var actionName = 'http.storefront.routes';
var nock = require('nock');

describe('http.storefront.routes implementing http.storefront.routes', function() {

    var action;

    before(function() {
        action = require('../src/domains/storefront/http.storefront.routes');
        nock.cleanAll();
        //    rewiremock('enzyme')
        //     .by(funcition 

        nock('http://test')
            .post(/.(platform\/applications\/authtickets)./, function(body) {
                // console.log('nock body', body);
                return true;
            })
            .times(1000) // '/api/platform/applications/authtickets/?responseFields=')
            .reply(200, {
                accessToken: 'abc',
                accessTokenExpiration: '2020-01-01T00:00:00.000Z',
                refreshToken: 'abc',
                refreshTokenExpiration: '2020-01-01T00:00:00.000Z'
            });

        nock('http://test')
            .get(/.(platform\/tenants)./)
            .times(1000)
            .reply(200, {
                domain: 'test.com',
                id: 123
            });
        nock('http://test/')
            .get("/api/commerce/customer/accounts/?startIndex=&pageSize=1&sortBy=&filter=userName%20eq%20dirkelfman%40gmail.com&fields=&q=&qLimit=&isAnonymous=&responseFields=")
            .reply(200, { items: [{ id: 123 }] });

        nock('https://st.auth.us-east-1.amazoncognito.com/')
            .get("/oauth2/userInfo")
            .reply(200, {
                "sub": "7a0d78ab-70db-491b-b8c4-8e25be0227ba",
                "name": "Thomas Phipps",
                "given_name": "Thomas",
                "family_name": "Phipps",
                "email": "dirkelfman@gmail.com",
                "username": "Facebook_10155431657396856"
            });
    });

    it('runs successfully', function(done) {

        var callback = function(err) {
            assert.ok(!err, "Callback was called with an error: " + err);
            // more assertions
            done();
        };

        var context = Simulator.context(actionName, callback);

        context.request = {
            body: 'eyJraWQiOiJrWWpVNHFMckQ1Tm1ZQ2JVaUQxcVhCbXBWaG5BSDc3eHRYOE5oVlwvUER3RT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3YTBkNzhhYi03MGRiLTQ5MWItYjhjNC04ZTI1YmUwMjI3YmEiLCJjb2duaXRvOmdyb3VwcyI6WyJ1cy1lYXN0LTFfZGFkRGxhTU94X0ZhY2Vib29rIl0sInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE1MzI5Mjk5NzQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2RhZERsYU1PeCIsImV4cCI6MTUzMjkzMzU3NCwiaWF0IjoxNTMyOTI5OTc0LCJ2ZXJzaW9uIjoyLCJqdGkiOiIwMWFiNjY2OC05MTM3LTRhOTUtYTA1ZC04YTgwY2Q2ODFiZWIiLCJjbGllbnRfaWQiOiIyYzVnZDljNHA4Z2xxNHF2NHRkZGloMG9nMyIsInVzZXJuYW1lIjoiRmFjZWJvb2tfMTAxNTU0MzE2NTczOTY4NTYifQ.S3IAgf5J7ks-aVzHUOPfDxucSYRSeminUZIOKtegk-EzkhxtuBDCw29SlhI-orr3BTzdME050oy_vMNLWJYaOyTFUOjVlK_n7Hj-yFvlvYaFGVgWbWLTHXAaKrE9YPkNVHpjn1L4hMAQlsmyYAIRBnMjtetBapGfbK9BOej3h5X2tg5cmdDk_paKqFvcK3UfKFI0L4DbZ0QWA90w885SHn3yLBosDWIOxQg-IugqMU-WJ_BExy8FSoKiH-QE70i5-6i_4xdWvBxifqCJzScti7S_bQp7ip6hWGpzQNDp-jlHiJz-KqN-6bKVEOYaqWx3w0DbyLWjG_cBTKaCUIsIqg'
        };
        context.configuration = {
            awsRegion: 'us-east-1',
            userPoolId: 'us-east-1_dadDlaMOx',
            userPoolDomain: 'st.auth.us-east-1.amazoncognito.com'
        };
        context.response = {
            end: function() {
                console.log('done');
                done();
            }
        };
        context.apiContext = {
            tenantPod: 'http://test/',
            appKey: 'a.b.c.d',
            baseUrl: 'http://test/',
            tenantId: 18371,
            tenant: 18371,
            site: 23024,
            catalog: 1,
            masterCatalog: 1,
            siteId: 23024
        };
        context.exec.loginUser = function(state, callback) {
            setTimeout(callback, 10);
        };
        require('../src/auth/cognitoTokenValidator').validateTs = false;
        Simulator.simulate(actionName, action, context, callback);
        //done();
    });
});