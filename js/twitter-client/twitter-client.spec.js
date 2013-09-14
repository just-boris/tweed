describe('twitter api client', function() {
    var twitter;

    //mock twitter API lib
    var Codebird  = window.Codebird = function() {};
    Codebird.prototype = {
        setConsumerKey: jasmine.createSpy('setConsumerKey'),
        __call: jasmine.createSpy('__call')
    };
    beforeEach(module('twitter'));
    beforeEach(inject(function($injector) {
        twitter = $injector.get('twitter');
    }));

    it("should authorise on twitter and resolve success callback", function() {
        var callbacks = {
            success: jasmine.createSpy('success'),
            failure: jasmine.createSpy('failure')
        };
        twitter.prepare('test_key', 'test_secret').then(callbacks.success, callbacks.failure);
        expect(Codebird.prototype.setConsumerKey.calls.length).toEqual(1);
        expect(Codebird.prototype.setConsumerKey).toHaveBeenCalledWith('test_key', 'test_secret');

        var serviceCallback = Codebird.prototype.__call.mostRecentCall.args[2];
        expect(typeof serviceCallback).toBe('function');
        expect(callbacks.success).not.toHaveBeenCalled();

        serviceCallback({httpstatus: 200});
        expect(callbacks.success).toHaveBeenCalled();
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
