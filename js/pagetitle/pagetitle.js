angular.module('pagetitle', []).directive('tweedPagetitle', function() {
    return function($scope, elm, attrs) {
        var defaultPageTitle = $scope.pageTitle = elm.html();
        $scope.$watch('lastQuery', function(query) {
            elm.html(query ? 'Statuses with "'+$scope.lastQuery+'" - Tweed' : defaultPageTitle);
        });
    };
});
