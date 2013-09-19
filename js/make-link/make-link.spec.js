describe('link filter', function() {
    var makeLinks;
    beforeEach(module('makeLinks'));
    beforeEach(module(function($provide) {
        $provide.constant('appBase', '/test');
    }));
    beforeEach(inject(function($filter) {
        makeLinks = $filter('makeLinks');
    }));

    it('should pass empty string', function() {
        expect(makeLinks('')).toBe('');
    });
    it('should wrap hashtags in the search link', function() {
        expect(makeLinks('text with #hashtag and #anotherone'))
            .toBe('text with <a href="/test?query=%23hashtag">#hashtag</a> and <a href="/test?query=%23anotherone">#anotherone</a>');
        expect(makeLinks('#hashtag in the beginning and the #ending'))
            .toBe('<a href="/test?query=%23hashtag">#hashtag</a> in the beginning and the <a href="/test?query=%23ending">#ending</a>')
    });
    it('should wrap comma and dot-separated hashtags', function() {
        expect(makeLinks('follow me and #retweet,#followme,#followyou'))
            .toBe('follow me and <a href="/test?query=%23retweet">#retweet</a>,<a href="/test?query=%23followme">#followme</a>,<a href="/test?query=%23followyou">#followyou</a>');
        expect(makeLinks("#hashtag. that's #all."))
            .toBe('<a href="/test?query=%23hashtag">#hashtag</a>. that\'s <a href="/test?query=%23all">#all</a>.');
    });
    it('should wrap links in the a tag', function() {
        expect(makeLinks('see the link http://super-site.com/page.html'))
            .toBe('see the link <a href="http://super-site.com/page.html">http://super-site.com/page.html</a>');
        expect(makeLinks('http://super-site.com at the beginning of string')).toBe('<a href="http://super-site.com">http://super-site.com</a> at the beginning of string');
    });
    it('should work all together', function() {
        expect(makeLinks('see http://super-site.com/cats.html #cats #cute'))
            .toBe('see <a href="http://super-site.com/cats.html">http://super-site.com/cats.html</a> <a href="/test?query=%23cats">#cats</a> <a href="/test?query=%23cute">#cute</a>')
    });
});
