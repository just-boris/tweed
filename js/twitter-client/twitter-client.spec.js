describe('twitter api client', function() {
    var twitter, Codebird, $rootScope;

    beforeEach(module('twitter'));
    beforeEach(inject(function($injector, _$rootScope_, _$timeout_) {
        //mock twitter API lib
        Codebird  = window.Codebird = function() {};
        Codebird.prototype = {
            setConsumerKey: jasmine.createSpy('setConsumerKey'),
            __call: jasmine.createSpy('__call')
        };
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        twitter = $injector.get('twitter');
    }));

    it("should authorise on twitter and fire event", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        $rootScope.$on('twitterReady', callbacks.success);
        $rootScope.$on('twitterAuthFailed', callbacks.failure);

        twitter.prepare('test_key', 'test_secret');
        expect(Codebird.prototype.setConsumerKey.calls.length).toEqual(1);
        expect(Codebird.prototype.setConsumerKey).toHaveBeenCalledWith('test_key', 'test_secret');

        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');
        serviceCallback({httpstatus: 200});

        expect(callbacks.success).toHaveBeenCalled();
    });

    it("should fire error event when authorization fails", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        $rootScope.$on('twitterReady', callbacks.success);
        $rootScope.$on('twitterAuthFailed', callbacks.failure);

        twitter.prepare('bad_key', 'bad_secret');

        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');
        serviceCallback({httpstatus: 401});

        expect(callbacks.success).not.toHaveBeenCalled();
        expect(callbacks.failure).toHaveBeenCalled();
    });

    it("should fire error event when browser doesn't support CORS", function() {
        var oldXMLHttpRequest = window.XMLHttpRequest,
            failureCallback = jasmine.createSpy('authFailCallback');
        window.XMLHttpRequest = angular.noop;

        $rootScope.$on('twitterAuthFailed', failureCallback);
        twitter.prepare('test_key', 'test_secret');
        $timeout.flush();
        expect(failureCallback).toHaveBeenCalled();

        window.XMLHttpRequest = oldXMLHttpRequest;
    });

    it("should make requests to api", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        twitter.request('test_method', {someParam: 'test'}).then(callbacks.success, callbacks.failure);

        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');
        expect(callbacks.success).not.toHaveBeenCalled();

        serviceCallback({httpstatus: 200});

        expect(callbacks.success).toHaveBeenCalled();
    });

    it("should cache success response like angular $http service", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        twitter.request('test_method', {someParam: 'test'}).then(callbacks.success, callbacks.failure);
        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');

        serviceCallback({httpstatus: 200});
        expect(Codebird.prototype.__call.calls.length).toBe(1);
        expect(callbacks.success).toHaveBeenCalled();

        twitter.request('test_method', {someParam: 'test'});
        expect(Codebird.prototype.__call.calls.length).toBe(1);
        expect(callbacks.success).toHaveBeenCalled();
    });


    it("should reject promise when request fails", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        twitter.request('wrong_method', {badParam: 'test'}).then(callbacks.success, callbacks.failure);

        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');
        expect(callbacks.success).not.toHaveBeenCalled();

        serviceCallback({httpstatus: 400});

        expect(callbacks.failure).toHaveBeenCalled();
    });
});
