/**
 * Created by baojx on 2015/9/29.
 */
var jsonMsgFormat = require("../../util/jsonMsgFormat");
var error_404 = function(req, res, next) {
    var err = new Error('文件找不到了');
    err.status = 404;
    next(err);
};
var error_500 = function(err, req, res, next) {
    res.status(err.status || 500);
    if(req.query.json && req.query.json == "1"){
        res.send(jsonMsgFormat.error(err.message, err.status));
    }else{
        res.render('error', jsonMsgFormat.error(err.message, err.status));
    }
};
module.exports = {
    error_404:error_404,
    error_500:error_500
}