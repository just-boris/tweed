angular.module('trends', ['twitter']).controller('TrendsCtrl', function($scope, twitter, $storage) {
    function onError(error) {
        $scope.$parent.requestError = error;
    }
    function onLoadTrends(reply) {
        $scope.trends = reply[0].trends;
    }
    function loadTrendsOnPlace(woeid) {
        twitter.request("trends_place", {id:woeid}).then(onLoadTrends, onError);
    }
    $scope.loadLocalTrends = function() {
        $scope.showLocalTrends = true;
        storage.setItem('show-local-trends', true);
        $scope.trends = [];
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                twitter.request("trends_closest", {
                    lat:position.coords.latitude,
                    long:position.coords.longitude
                }).then(function(reply) {
                        loadTrendsOnPlace(reply[0].woeid);
                    }, onError);
            }, function() {
                onError({errors:[{message: 'Geolocation error'}]});
                $scope.$apply();
            });
        } else {
            onError({errors:[{message: 'Browser does not support geolocation'}]});
            $scope.$apply();
        }
    };
    $scope.loadWorldwideTrends = function() {
        $scope.showLocalTrends = false;
        storage.setItem('show-local-trends', false);
        $scope.trends = [];
        loadTrendsOnPlace(1 /*worldwide*/);
    };
    $scope.find = function(query) {
        $scope.$parent.query = query;
        $scope.$parent.find();
    };
    var storage = $storage('tweed');
    $scope.$on('twitterReady', function() {
        $scope.showLocalTrends = storage.getItem('show-local-trends');
        if($scope.showLocalTrends) {
            $scope.loadLocalTrends();
        }
        else {
            $scope.loadWorldwideTrends();
        }
    })
});
