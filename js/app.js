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
}).directive('infiniteScroll', function($window) {
    return function(scope, element, attrs) {
        $window = angular.element($window);
        $window.on('scroll', function() {
            var windowBottom = $window.height() + $window.scrollTop(),
                elementBottom = element.offset().top + element.height() * 0.9,
                remaining = elementBottom - windowBottom;

            if(remaining <= $window.height() && scope.$apply(attrs.ngShow)) {
                scope.$apply(attrs.ngClick);
            }
        });
    }
}).controller('AppCtrl', function($scope, $location, twitter, storage) {
    function setLoading(loading) {
        $scope.requestPending = loading;
        $scope.buttonText = loading ? 'Loading...' : 'Find!'
    }
    $scope.find = function() {
        setLoading(true);
        storage.put("query", $scope.query);
        $location.search("query", $scope.query);
        $scope.lastQuery = $scope.query;
        $scope.pageNum = 1;
        api("search_tweets", "q="+$scope.query, function (reply) {
            $scope.statuses = reply.statuses;
            setLoading(false);
        });
    };
    $scope.nextPage = function() {
        setLoading(true);
        var lastStatusId = $scope.statuses[$scope.statuses.length-1].id;
        api("search_tweets", "q="+$scope.lastQuery+'&max_id='+lastStatusId, function (reply) {
            $scope.statuses = $scope.statuses.concat(reply.statuses);
            setLoading(false);
        });
    };
    setLoading(true);
    twitter.prepare('FFUuamGgKkXA5oHbNPtubQ', 'zTESbQPPM2FzYqUHvUV7lCIavQ6A0db74Pjn0W4N4').then(function(result) {
        api = result;
        setLoading(false);
        $scope.$watch(function() {
            return $location.search().query
        }, function(query) {
            if(query) {
                $scope.find()
            }
        });
    });
    var api;
    $scope.query = $location.search().query || "";
    setLoading(true);
});
