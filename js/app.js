angular.module('tweed', ['twitter', 'pagetitle', 'trends', 'infinite-scroll', 'localStorageModule'])
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
        var lastStatusId = $scope.statuses[$scope.statuses.length-1].id_str;
        twitter.request("search_tweets", {q:$scope.lastQuery, max_id: lastStatusId}).then(function (reply) {
            //we need to remove first tweet, because it is loading twice
            //it is feature of twitter pagination
            if(reply.statuses.length > 0 && reply.statuses[0].id_str == lastStatusId) {
                reply.statuses.splice(0, 1);
            }
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
    $scope.$on('twitterReady', function() {
        afterLoad();
        $scope.$watch(function() {
            return $location.search().query
        }, function(query) {
            $scope.query = query;
            if(query) {
                $scope.find();
            }
            else {
                $scope.reset();
            }
        });
    });
    $scope.$on('twitterAuthFailed', function(event, errors) {
        errback(errors);
    });
}).config(function($locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
});
