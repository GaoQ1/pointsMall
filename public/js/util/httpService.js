/**
 * Created by baojx on 2015/10/9.
 */
var http = function(option){
    var config = {
        host:"",
        errHandler:function(msg){
            console.log(msg);
        },
        loginHandler:function(){
            if(bridgeUserInfo.isKdlsAppBridge){
                bridgeCheckAppLogin();
            }else{
                window.location = "/login";
            }
        }};
    if(option){
        for (var key in option) {
            config[key] = option[key];
        }
    }

    var get = function(url, param, callback){
        request(url, param, "GET", callback);
    };
    var post = function(url, param, callback){
        request(url, param, "POST", callback);
    };

    var request = function(url, param, type, callback){
        $.ajax({
            url: config.host + url,
            dataType: "json",
            data: param,
            type: type,
            success: function(data) {
                if (data.status.code == "202") {
                    //Not Login
                    if(config.loginHandler){
                        config.loginHandler();
                    }
                } else if (data.status.code == "1") {
                    if(callback) callback(data.result);
                } else {
                    config.errHandler(data.status.desp);
                }
            },
            error: function(e) {
                config.errHandler("数据请求错误");
            }
        });
    };
    return{
        get:get,
        post:post
    };
};