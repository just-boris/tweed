angular.module('twitter', ['ngResource']).factory('twitter', function($q, $rootScope) {
    function callApi(method, params) {
        var deferred = $q.defer();
        cb.__call(method, params, function (reply) {
            deferred.resolve(reply);
            $rootScope.$apply();
        }, true);
        return deferred.promise;
    }
    var cb = new Codebird();
    return {
        prepare: function(consumerKey, consumerSecret) {
            cb.setConsumerKey(consumerKey, consumerSecret);
            return callApi("oauth2_token", {})
        },
        request: callApi
    }
});