angular.module('twitter', ['ngResource']).factory('twitter', function($q, $timeout, $rootScope) {
    var cache = {};
    function callApi(method, params) {
        var deferred = $q.defer();
        var key = method + JSON.stringify(params);
        if(!cache[key]) {
            cb.__call(method, params, function (reply) {
                deferred[reply.httpstatus === 200 ? 'resolve' : 'reject'](reply);
                if(reply.httpstatus === 200) {
                    cache[key] = reply;
                }
                $rootScope.$apply();
            }, true);
        }
        else {
            $timeout(function() {
                deferred.resolve(cache[key]);
            });
        }
        return deferred.promise;
    }
    var cb = new Codebird();
    return {
        prepare: function(consumerKey, consumerSecret) {
            var canUseCors = 'withCredentials' in new XMLHttpRequest();
            cb.setConsumerKey(consumerKey, consumerSecret);
            if(canUseCors) {
                callApi("oauth2_token", {}).then(function () {
                    $rootScope.$broadcast('twitterReady');
                }, function (reply) {
                    $rootScope.$broadcast('twitterAuthFailed', reply);
                });
            }
            else {
                $timeout(function() {
                    $rootScope.$broadcast('twitterAuthFailed', {errors: [{message: "Your browser doesn't support work with API, sorry"}]});
                });
            }
        },
        request: callApi
    }
});