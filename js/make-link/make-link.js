angular.module('makeLinks', []).constant('appBase', location.pathname).filter('makeLinks', function(appBase) {
    return function(text) {
        function wrapHashtags(match) {
            return '<a href="'+appBase+'?query='+encodeURIComponent(match)+'">'+match+'</a>'
        }
        return text.replace(/(http(s?)):\/\/\S+/, '<a href="$&">$&</a>') //wrap external urls
                   .replace(/\B(#[^\s&,.]+)/gi, wrapHashtags); //wrap hashtags
    }
});