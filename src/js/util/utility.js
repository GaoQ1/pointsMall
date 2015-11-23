/**
 * Created by baojx on 2015/10/12.
 */
var utility = function(){
    var extend = function(tar, obj) {
        if (!obj) return;
        for (var key in obj) {
            tar[key] = obj[key];
        }
        return tar;
    };

    return {
        extend:extend
    };
}();