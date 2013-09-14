angular.module('tweed', ['twitter', 'infinite-scroll']).factory('storage', function() {
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
        $scope.requestPending = loading;
    }
    $scope.find = function() {
        if($scope.requestPending) {
            return;
        }
        setLoading(true);
        storage.put("query", $scope.query);
        $location.search("query", $scope.query);
        $scope.lastQuery = $scope.query;
        $scope.statuses = [];
        twitter.request("search_tweets", {q:$scope.lastQuery}).then(function (reply) {
            $scope.statuses = reply.statuses;
            setLoading(false);
        });
    };
    $scope.nextPage = function() {
        if($scope.requestPending) {
            return;
        }
        setLoading(true);
        var lastStatusId = $scope.statuses[$scope.statuses.length-1].id;
        twitter.request("search_tweets", {q:$scope.lastQuery, max_id: lastStatusId}).then(function (reply) {
            $scope.statuses = $scope.statuses.concat(reply.statuses);
            setLoading(false);
        });
    };
    setLoading(true);
    twitter.prepare('FFUuamGgKkXA5oHbNPtubQ', 'zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4').then(function() {
        setLoading(false);
        $scope.$watch(function() {
            return $location.search().query
        }, function(query) {
            if(query) {
                $scope.find()
            }
        });
    });
    $scope.query = $location.search().query || "";
    setLoading(true);
}).config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
});
