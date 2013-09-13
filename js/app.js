angular.module('tweed', ['twitter']).factory('storage', function() {
    "use strict";
    var prefix = "tweed-";
    return {
        put: function(name, value) {
            if(value) {
                localStorage.setItem(prefix+name, value);
            } else {
                localStorage.removeItem(prefix+name);
            }
        },
        get: function(name) {
            return localStorage.getItem(prefix+name);
        }
    };
}).controller('AppCtrl', function($scope, $location, twitter, storage) {
    function setLoading(loading) {
        $scope.twitterLoading = loading;
        $scope.buttonText = loading ? 'Loading...' : 'Find!'
    }
    $scope.find = function() {
        setLoading(true);
        storage.put("query", $scope.query);
        $location.search("query", $scope.query)
        api("search_tweets", "q="+$scope.query, function (reply) {
            $scope.statuses = reply.statuses;
            setLoading(false);
        });
    };
    setLoading(true);
    twitter.prepare('FFUuamGgKkXA5oHbNPtubQ', 'zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4').then(function(result) {
        api = result;
        setLoading(false);
        if($scope.query) {
            $scope.find();
        }
    });
    var api;
    $scope.query = $location.search().query || storage.get("query") || "";
    setLoading(true);
});
