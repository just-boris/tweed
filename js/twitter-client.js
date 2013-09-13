angular.module('twitter', ['ngResource']).factory('twitter', function($q, $rootScope) {
    function wrapCallback(callback) {
        return function() {
            var args = arguments;
            $rootScope.$apply(function() {
                callback.apply(window, args);
            });
        }
    }
    return {
        prepare: function(consumerKey, consumerSecret) {
            var cb = new Codebird(),
                deferred = $q.defer();
            cb.setConsumerKey(consumerKey, consumerSecret);
            cb.__call("oauth2_token", {}, function (reply) {
//                var bearer_token = reply.access_token;
                deferred.resolve(function (method, params, callback) {
                    cb.__call(method, params, wrapCallback(callback),
                        true // this parameter required
                    );
                });
                $rootScope.$apply();
            });
            return deferred.promise;
        }
    }
});