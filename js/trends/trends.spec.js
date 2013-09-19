describe('twitter trends controller', function() {
    var twitterPrepare, twitterRequest, twitterApiPromise,
        storage,
        oldGeolocation, geoLat, geoLon,
        $q, $controller, scope;

    function createTwitterMock() {
        twitterPrepare = jasmine.createSpy('twitterPrepare');
        twitterRequest = jasmine.createSpy('twitterRequest');
        return {
            prepare: twitterPrepare,
            request: twitterRequest.andCallFake(function() {
                twitterApiPromise = $q.defer();
                return twitterApiPromise.promise;
            })
        }
    }

    beforeEach(module('tweed'));
    beforeEach(inject(function(_$controller_, $rootScope, _$q_) {
        $q = _$q_;
        $controller = _$controller_;
        scope = $rootScope.$new();
    }));
    beforeEach(function() {
        oldGeolocation = navigator.geolocation.getCurrentPosition;
        navigator.geolocation.getCurrentPosition = function(callback) {
            callback({coords: {latitude: geoLat, longitude: geoLon}})
        }
    });

    function createController(storageDefaults) {
        storage = {
            getItem: jasmine.createSpy('storageGetItem').andCallFake(function(key) {
                return storageDefaults[key];
            }),
            setItem: jasmine.createSpy('storageSetItem')
        };
        $controller('TrendsCtrl', {
            $scope: scope,
            twitter: createTwitterMock(),
            $storage: function() {
                return storage;
            }
        });
    }


    it('should load trends when twitter is ready', function() {
        createController({});
        expect(twitterRequest).not.toHaveBeenCalled();
        scope.$emit('twitterReady');

        expect(twitterRequest).toHaveBeenCalled();
        var trendsResponse = ['trend1', 'trend2'];
        twitterApiPromise.resolve([{trends:trendsResponse}]);
        scope.$apply();

        expect(scope.trends).toBe(trendsResponse);
    });


    it('should load trend settings from storage', function() {
        createController({'show-local-trends': true});
        spyOn(scope, 'loadLocalTrends');
        spyOn(scope, 'loadWorldwideTrends');
        scope.$emit('twitterReady');

        expect(scope.showLocalTrends).toBe(true);
        expect(scope.loadWorldwideTrends).not.toHaveBeenCalled();
        expect(scope.loadLocalTrends).toHaveBeenCalled();

    });

    it('should get location before load local trends', function() {
        createController({'show-local-trends': true});
        geoLat = 15;
        geoLon = 42;

        scope.$emit('twitterReady');

        expect(twitterRequest.mostRecentCall.args[1].lat).toBe(geoLat);
        expect(twitterRequest.mostRecentCall.args[1].long).toBe(geoLon);

        twitterApiPromise.resolve([{woeid: 10}]);
        scope.$apply();

        var trendsResponse = ['trend1', 'trend2'];
        twitterApiPromise.resolve([{trends:trendsResponse}]);
        scope.$apply();

        expect(scope.trends).toBe(trendsResponse);
    });

    it('should show error message when geolocation fails', function() {
        navigator.geolocation.getCurrentPosition = function(callback, errback) {
            errback({message: 'Simulated error'});
        };
        createController({'show-local-trends': true});
        scope.$emit('twitterReady');

        expect(scope.trendsError).toBeDefined();
        expect(scope.trendsError.errors[0].message).toBe('Simulated error');
    });
    //TODO: create a test for unsupported geolocation. Geolocation object cannot be deleted to simulate this case

    it('should save new settings in the storage', function() {
        createController({'show-local-trends': false});
        scope.$emit('twitterReady');
        var trendsResponse = ['trend1', 'trend2'];
        twitterApiPromise.resolve([{trends:trendsResponse}]);
        scope.$apply();

        scope.loadLocalTrends();
        expect(scope.showLocalTrends).toBe(true);
        expect(storage.setItem.mostRecentCall.args[0]).toBe('show-local-trends');
        expect(storage.setItem.mostRecentCall.args[1]).toBe(true);
    });


    afterEach(function() {
        scope.$destroy();
    });

    afterEach(function() {
        navigator.geolocation.getCurrentPosition = oldGeolocation;
    })
});
