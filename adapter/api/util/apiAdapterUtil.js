/**
 * Created by baojx on 2015/10/8.
 */
var request = require('request');
var aesutil = require('../../../util/aesutil');
var md5 = require('../../../util/md5util');
var urlparser = require('url');

var apiUtil = function (req, res, route, callback) {
    var config = global.API;
    if(config[route]){
        config = config[route];
        var index = 0;
        var body = req.body ? req.body : {};

        var loopback = function(err, result){
            if(err){
                callback(err, null);
                return;
            }
            var key = config.config[index]["key"];
            if(key != null){
                if(result instanceof Array){
                    body[key] = result;
                }else{
                    body[key] = extend({}, result);
                }
            }else{
                if(result instanceof Array){
                    body = result;
                }else{
                    body = extend(body, result);
                }
            }

            if(index == config.config.length -1){
                callback(null, body);
            }else{
                index++;
                generatRequest(req, res, body, config.config[index], loopback);
            }
        };
        generatRequest(req, res, body, config.config[index], loopback);
    }else{
        callback(null, null);
    }
}
var extend = function(tar, obj) {
    if (!obj) return;
    for (var key in obj) {
        tar[key] = obj[key];
    }
    return tar;
};
var generatRequest = function(req, res, body, config, callback){
    var comand = config.command;
    if(config["baseurl"]){
        comand = global.CONFIG[config["baseurl"]] + comand;
    }
    var params = comand.match(/\{.*?\}/g);
    if(params){
        for(var i= 0, count=params.length; i<count; i++){
            var param = params[i].replace("{","").replace("}","");
            var p = param.split(".");
            //var value = param.indexOf("body.") == 0 ? body : req;
            var value = req;
            if(param.indexOf("CONFIG.") == 0){
                value = global;
                for(var j=0; j< p.length; j++) value = value[p[j]];
            }else if(param.indexOf("URL.") == 0){
                value = urlparser.parse(req.url).query;
            }else{
                for(var j=0; j< p.length; j++) value = value[p[j]];
            }
            comand = comand.split(params[i]).join(value);
        }
    }
    var data = {};
    if(config.data){
        if(config.data == "body"){
            data = body;
        }else {
            for (var key in config.data) {
                var p = config.data[key].split(".");
                //var value = param.indexOf("body.") == 0 ? body : req;
                var value = req;
                for (var j = 0; j < p.length; j++)  value = value[p[j]];
                data[key] = value;
            }
        }
    }
    requestApi(req,res,comand,data,config,function(err, body){
        if(callback) callback(err, body);
    });
}

var requestApi = function(req, res, comand, data, config, callback){
    console.info("API REQUEST TO : " + comand);
    if(data) console.info("API REQUEST DATA : " + JSON.stringify(data));

    var options = {
        url: comand,
        method:config.method
    };
    if(data){
        var nonce = Date.parse(new Date());
        if(config.auth == "true"){
            var signString = '';
            var codeArray = new Array();
            data["accessToken"] = req.body.accessToken;
            for (var code in data){
                codeArray.push(code);
            }
            codeArray.sort();
            for (var i in codeArray){
                var code = codeArray[i];
                signString += (signString != '' ? '&' : '') + code + '=' + data[code];
            }
            console.log('signString:' + signString);
            data = {
                data:JSON.stringify(data), appId:global.CONFIG.APPID, nonce:nonce, sign:md5.md5Sign(signString)
            };
            options.data = data;
        }else {
            if (config.encrypt && config.encrypt == "true") {
                var Secret = global.CONFIG.SECRET;
                if(req.session && req.session.loginInfo && req.session.loginInfo.Secret){
                    Secret = req.session.loginInfo.Secret;
                }
                data = aesutil.aesEncrypt(JSON.stringify(data), Secret);
                options.data = {
                    data:data,appId:global.CONFIG.APPID,nonce:nonce
                }
            } else {
                options.data = data;
            }
        }
        //动态的APP_ID处理
        if(req.session && req.session.loginInfo && req.session.loginInfo.appId){
            options.data.appId = req.session.loginInfo.appId;
        }
        if(!config.includeAppId || config.includeAppId != "true"){
            delete  options.data.appId;
        }
        //兼容微信进来的用户，如果有openid则添加
        if(req.session && req.session.loginInfo && req.session.loginInfo.openId){
            options.data.openId = req.session.loginInfo.openId;
        }
        //GET 下需要将数据串接到url后面
        if(options.method == "GET"){
            options.url = options.url + (options.url.indexOf("?") == -1 ? "?" : "&");
            var p = [];
            for (var k in options.data){
                if(typeof options.data[k] ==  "object"){
                    p.push(k + "=" + JSON.stringify(options.data[k]));
                }else{
                    p.push(k + "=" + options.data[k]);
                }
            }
            options.url = options.url + p.join("&");
        }
    }
    var responseHandler = function(error, response, body) {
        console.info("API RESPONSE : " +  body);
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            if(body && body.status && body.status.code && body.status.code.toString() != "1"){
                var err = new Error(body.status.desp);
                err.status = body.status.code;
                if(callback) callback(err,null);
            }else{
                var r = body.result;
                if(!body.result && (body.status.desp || body.status.desc)){
                    r = {msg:body.status.desp || body.status.desc};
                }
                if(callback) callback(null,r);
            }
        }else{
            //res.send({result:{},status:{code:0,desp:"api " + comand + " request error"}});
            var err = new Error('REQUEST API ERROR');
            err.status = "500";
            if(callback) callback(err,null);
        }
    };
    if(options.method == "POST"){
        request.post(options.url, responseHandler).form(options.data);
    }else{
        request.get(options.url, responseHandler);
    }
};

module.exports = {
    apiUtil:apiUtil
}