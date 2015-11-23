/**
 * Created by baojx on 2015/9/29.
 */

var apiAdapterUtil = require('./util/apiAdapterUtil');
var jsonMsgFormat = require("../../util/jsonMsgFormat");
var api = function (req, res, next) {
    var route = req.url.split("?");
    console.info("This is api auto request for : " + route);
    if(route.length >= 0){
        route = route[0];
    }
    var config = global.API;
    config = config[route];
    if(!config){
        next();
        return;
    }
    if(config.config && config.config[0].auth == "true"){
        if(req.session.loginInfo == null || !req.session.loginInfo.accessToken){
            var err = new Error('未授权的访问');
            err.status = "202";
            next(err);
            return;
        }else{
            if(!req.body) req.body = {};
            req.body.accessToken = req.session.loginInfo.accessToken;
        }
    }
    var exec_start_at = Date.now();
    apiAdapterUtil.apiUtil(req, res, route, function(err,body){
        if(err){
            next(err);
            return;
        }else if(body != null){
            res.set('X-API-Time', String(Date.now() - exec_start_at));
            if(req.query.json && req.query.json == "1") res.send(jsonMsgFormat.response(body));
            else {
                if(config.title) body["pageTitle"] = config.title;
                res.render(config.template, jsonMsgFormat.response(body));
            }
        }else{
            next();
        }
    });
}

module.exports = {
    api:api
}