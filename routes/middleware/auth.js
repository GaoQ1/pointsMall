/**
 * Created by baojx on 2015/9/29.
 */
var users = function(req, res, next) {
    if(!req.session || !req.session.loginInfo){
        res.redirect("/login");
    }else{
        next();
    }
}

module.exports = {
    users:users
}