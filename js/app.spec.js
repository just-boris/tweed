describe('app controller', function() {
    var twitterMock = {
            prepare: function() {
                twitterApiPromise = $q.defer();
                return twitterApiPromise.promise;
            },
            request: function() {
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
        $controller('AppCtrl', {
            $scope: scope,
            $location: {
                search: function() {
                    return search;
                }
            },
            twitter: twitterMock,
            storage: {
                put: angular.noop,
                get: angular.noop
            }
        });
    }


    it('should make request authorize on twitter API', function() {
        createController({});
        expect(twitterMock.prepare).toHaveBeenCalled();
        expect(scope.requestPending).toBe(true);
    });

    it('should set loading state when twitter API is preparing and unset when ready', function() {
        createController({});
        expect(scope.requestPending).toBe(true);

        twitterApiPromise.resolve();
        scope.$apply();

        expect(scope.requestPending).toBe(false);
    });

    it('should show error message when auth fails', function() {
        createController({query:'test'});

        var errorObj = {error: 'error'};
        twitterApiPromise.reject(errorObj);
        scope.$apply();

        expect(scope.requestPending).toBe(false);
        expect(scope.requestError).toBe(errorObj);
    });

    it('should contain empty query value', function() {
        createController({});
        expect(scope.query).toBe('');
    });

    it('should grab query from location service', function() {
        createController({query: 'test'});
        expect(scope.query).toBe('test');
    });

    it('should not let do search while twitter API is not ready', function() {
        spyOn(twitterMock, 'request').andCallThrough();
        createController({query:'test'});
        scope.find();
        expect(twitterMock.request).not.toHaveBeenCalled();

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();
        expect(twitterMock.request).toHaveBeenCalled();
    });

    it('should set loading state before search', function() {
        createController({query:'test'});

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();
        expect(scope.requestPending).toBe(true);
    });

    it('should show error message when search error happens', function() {
        createController({query:'test'});

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();
        var errorObj = {error: 'error'};
        twitterApiPromise.reject(errorObj);
        scope.$apply();

        expect(scope.requestError).toBe(errorObj);
    });

    it('should load statuses through service', function() {
        createController({query:'test'});

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();

        twitterApiPromise.resolve({statuses: ['status1', 'status2']});
        scope.$apply();

        expect(scope.statuses.length).toBe(2);
    });


    it('should load next page when needed', function() {
        createController({query:'test'});

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();

        twitterApiPromise.resolve({statuses: ['status1', 'status2']});
        scope.$apply();

        scope.nextPage();
        twitterApiPromise.resolve({statuses: ['status3']});
        scope.$apply();

        expect(scope.statuses.length).toBe(3);
    });

    it('should end pagination when next page is empty', function() {
        createController({query:'test'});

        twitterApiPromise.resolve();
        scope.$apply();

        scope.find();

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
