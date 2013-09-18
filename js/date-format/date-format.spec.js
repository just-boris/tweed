describe('date formatter', function() {
    var formatTwitterDate, formatDate;
    beforeEach(module('tweed'));
    beforeEach(inject(function($filter) {
        formatTwitterDate = $filter('twitterDate');
        formatDate = $filter('date')
    }));

    it('should pass undefined value', function() {
        expect(formatTwitterDate()).toBeUndefined();
    });

    it('should format defined value', function() {
        var formatString = 'MMM d, H:mm:ss';
        expect(formatTwitterDate("Sun Sep 15 10:42:10 +0000 2013", formatString)).toBe(formatDate('2013-09-15T10:42:10.000Z', formatString));
    });

    it('should pass wrong date strings', function() {
        expect(formatTwitterDate('i am not date')).toBe('i am not date');
    });
});