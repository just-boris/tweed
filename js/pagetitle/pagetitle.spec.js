describe('pagetitle directive', function() {
    var element, $rootScope;
    beforeEach(module('pagetitle'));
    beforeEach(inject(function($compile, _$rootScope_) {
        $rootScope = _$rootScope_;
        $rootScope.lastQuery = 'test query';
        element = $compile('<div tweed-pagetitle>default title</div>')($rootScope);
        $rootScope.$digest();
    }));

    it('should update title, watching scope', function() {
        expect(element.html()).toBe('Statuses with "test query" - Tweed');
        $rootScope.lastQuery = 'another query';
        $rootScope.$digest();
        expect(element.html()).toBe('Statuses with "another query" - Tweed');
    });

    it('should reset default title when query is empty', function() {
        $rootScope.lastQuery = '';
        $rootScope.$digest();
        expect(element.html()).toBe('default title');
    });
});
