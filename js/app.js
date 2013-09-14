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
    function beforeLoad() {
        $scope.requestPending = true;
    }
    function afterLoad() {
        $scope.requestPending = false;
    }
    function errback(response) {
        $scope.requestError = response;
        afterLoad();
    }
    $scope.find = function() {
        if($scope.requestPending || !$scope.query) {
            return;
        }
        beforeLoad();
        $scope.reset();
        storage.put("query", $scope.query);
        $location.search("query", $scope.query);
        $scope.lastQuery = $scope.query;
        twitter.request("search_tweets", {q:$scope.lastQuery}).then(function (reply) {
            $scope.statuses = reply.statuses;
            afterLoad();
        }, errback);
    };
    $scope.nextPage = function() {
        if($scope.requestPending) {
            return;
        }
        beforeLoad();
        var lastStatusId = $scope.statuses[$scope.statuses.length-1].id;
        twitter.request("search_tweets", {q:$scope.lastQuery, max_id: lastStatusId}).then(function (reply) {
            $scope.statuses = $scope.statuses.concat(reply.statuses);
            afterLoad();
        }, errback);
    };
    $scope.reset = function() {
        delete $scope.requestError;
        delete $scope.lastQuery;
        $scope.statuses = [];
    };
    beforeLoad();
    twitter.prepare('FFUuamGgKkXA5oHbNPtubQ', 'zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4').then(function() {
        afterLoad();
        $scope.$watch(function() {
            return $location.search().query
        }, function() {
            $scope.find()
        });
    }, errback);
    $scope.query = $location.search().query || "";
}).config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
});
