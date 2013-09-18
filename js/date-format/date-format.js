//default date formatter can't parse twitter date, use custom
angular.module('dateFormat', []).filter('twitterDate', function($filter) {
    return function(date, format) {
        if(date) {
            var dateObj = new Date(date.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/, "$1 $2 $4 $3 UTC"));
            if(!isNaN(dateObj.valueOf())) {
                return $filter('date')(dateObj, format);
            }
        }
        return date;
    }
});