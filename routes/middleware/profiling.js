/**
 * Created by baojx on 2015/9/29.
 */
var timer = function (req, res, next) {
    var exec_start_at = Date.now();
    var _send = res.send;
    res.send = function () {
        res.set('X-Execution-Time', String(Date.now() - exec_start_at));
        return _send.apply(res, arguments);
    };
    next();
}

module.exports = {
    timer:timer
}