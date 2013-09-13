describe('app controller tests', function() {
    var twitterMock = {
            prepare: function() {
                twitterApiPromise = $q.defer();
                return twitterApiPromise.promise;
            }
        }, twitterApiPromise,
        $q, $controller, scope;

    beforeEach(module('tweed'));
    beforeEach(inject(function(_$controller_, $rootScope, _$q_) {
        $q = _$q_;
        $controller = _$controller_;
        spyOn(twitterMock, 'prepare').andCallThrough();
        scope = $rootScope.$new();
    }));

    function createController(search) {
        $controller('AppCtrl', {$scope: scope, $location: {
            search: function() {
                return search;
            }
        }, twitter: twitterMock, storage: {}})
    }


    it('should make request authorize to twitter API', function() {
        createController({});
        expect(twitterMock.prepare).toHaveBeenCalled();
        expect(scope.requestPending).toBe(true);
    });

    it('should contain empty query value', function() {
        createController({});
        expect(scope.query).toBe('');
    });

    it('should grab query from location service', function() {
        createController({query: 'test'});
        expect(scope.query).toBe('test');
    });

    afterEach(function() {
        scope.$destroy();
    })
});
