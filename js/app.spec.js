describe('app controller', function() {
    var twitterPrepare, twitterRequest, twitterApiPromise,
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

    function createController(search) {
        $controller('AppCtrl', {
            $scope: scope,
            $location: {
                search: function() {
                    return search;
                }
            },
            twitter: createTwitterMock()
        });
    }


    it('should make request authorize on twitter API', function() {
        createController({});
        expect(twitterPrepare).toHaveBeenCalled();
        expect(scope.requestPending).toBe(true);
    });

    it('should set loading state when twitter API is preparing and unset when ready', function() {
        createController({});
        expect(scope.requestPending).toBe(true);
        scope.$emit('twitterReady');

        expect(scope.requestPending).toBe(false);
    });

    it('should show error message when auth fails', function() {
        createController({query:'test'});

        var errorObj = {error: 'error'};
        scope.$emit('twitterAuthFailed', errorObj);

        expect(scope.requestPending).toBe(false);
        expect(scope.requestError).toBe(errorObj);
    });

    it('should contain empty query value', function() {
        createController({});
        expect(scope.query).toBe('');
    });

    it('should not let do search while twitter API is not ready', function() {
        createController({query:'test'});
        scope.find();
        expect(twitterRequest).not.toHaveBeenCalled();
        scope.$emit('twitterReady');

        scope.find();
        expect(twitterRequest).toHaveBeenCalled();
    });

    it('should grab query from location service and search when twitter ready', function() {
        createController({query: 'test'});
        expect(scope.query).toBe('test');
        scope.$emit('twitterReady');
        scope.$apply();

        expect(twitterRequest).toHaveBeenCalled();
    });

    it('should set loading state before search', function() {
        createController({query: 'test'});
        scope.$emit('twitterReady');
        scope.$apply();

        expect(scope.requestPending).toBe(true);
    });

    it('should show error message when search error happens', function() {
        createController({query: 'test'});
        scope.$emit('twitterReady');
        scope.$apply();

        var errorObj = {error: 'error'};
        twitterApiPromise.reject(errorObj);
        scope.$apply();

        expect(scope.requestError).toBe(errorObj);
    });

    it('should load statuses through service', function() {
        createController({query: 'test'});
        scope.$emit('twitterReady');
        scope.$apply();

        twitterApiPromise.resolve({statuses: ['status1', 'status2']});
        scope.$apply();

        expect(scope.statuses.length).toBe(2);
    });


    it('should load next page when needed', function() {
        createController({query:'test'});
        scope.$emit('twitterReady');
        scope.$apply();

        twitterApiPromise.resolve({statuses: ['status1', 'status2']});
        scope.$apply();

        scope.nextPage();
        twitterApiPromise.resolve({statuses: ['status3']});
        scope.$apply();

        expect(scope.statuses.length).toBe(3);
    });

    it('should end pagination when next page is empty', function() {
        createController({query:'test'});
        scope.$emit('twitterReady');
        scope.$apply();

        twitterApiPromise.resolve({statuses: ['status1', 'status2']});
        scope.$apply();

        scope.nextPage();
        twitterApiPromise.resolve({statuses: []});
        scope.$apply();

        expect(scope.noMoreTweets).toBe(true);
    });


    afterEach(function() {
        scope.$destroy();
    })
});
