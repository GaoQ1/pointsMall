/**
 * Created by baojx on 2015/10/9.
 */
var response = function(body){
    return {result : body, status: { code : 1, desp:"response" }}
}
var error = function(err, code){
    return {result : err, status: { code: code, desp:"error" }}
}
module.exports = {
    response:response,
    error:error
}