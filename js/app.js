angular.module('tweed', ['twitter', 'trends', 'infinite-scroll', 'localStorageModule'])
//default date formatter can't parse twitter date, use custom
.filter('twitterDate', function($filter) {
    return function(date, format) {
        if(date) {
            var dateObj = new Date(date);
            if(!isNaN(dateObj.valueOf())) {
                return $filter('date')(dateObj, format);
            }
        }
        return date;
    }
})
.controller('AppCtrl', function($scope, $location, twitter) {
    "use strict";
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
        twitter.request("search_tweets", {q:$scope.lastQuery, max_id: lastStatusId+1}).then(function (reply) {
            if(reply.statuses.length > 0) {
                $scope.statuses = $scope.statuses.concat(reply.statuses);
            }
            else {
                $scope.noMoreTweets = true;
            }
            afterLoad();
        }, errback);
    };
    $scope.reset = function() {
        delete $scope.requestError;
        delete $scope.lastQuery;
        $scope.statuses = [];
    };
    beforeLoad();
    twitter.prepare('FFUuamGgKkXA5oHbNPtubQ', 'zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4');
    $scope.query = $location.search().query || "";
    $scope.$on('twitterReady', function() {
        afterLoad();
        $scope.$watch(function() {
            return $location.search().query
        }, function() {
            $scope.find()
        });
    });
    $scope.$on('twitterAuthFailed', function(event, errors) {
        errback(errors);
    });
}).config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
});
