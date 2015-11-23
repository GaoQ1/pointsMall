/**
 * Created by baojx on 2015/10/12.
 */
var express = require('express');
var router = express.Router();
var apiAdapterUtil = require('../adapter/api/util/apiAdapterUtil');
var request = require('request');

router.get("/weixin/:openId/:accessToken?", function(req, res, next) {
    console.log('微信登录积分商城');
    if(!req.params || !req.params.openId || !req.params.accessToken){
        res.redirect("/login?openId=" + req.params.openId);
    }
    var openId = req.params.openId;
    var accessToken = req.params.accessToken;
    setSession(req, {openId:openId,accessToken:accessToken});
    res.redirect("/mall");
});

router.get("/app/:appId/:accessToken", function(req, res, next) {
    console.log('APP登录积分商城');
    if(!req.params||!req.params.appId || !req.params.accessToken){
        res.redirect("/login");
    }
    var appId = req.params.appId;
    var accessToken = req.params.accessToken;
    setSession(req, {accessToken:accessToken},appId);
    res.redirect("/mall");
});

router.get("/login", function(req, res, next) {
    res.render("login",{openId:req.query.openId});
});

var setSession = function(req, body, appid, secret){
    req.session.loginInfo = {
        accessToken: body.accessToken,
        openId : body.openId
    };
    if(appid){
        req.session.loginInfo.appId = appid;
    }
    if(secret){
        req.session.loginInfo.secret = secret;
    }
    if(body.userInfo){
        req.session.loginInfo.email = body.userInfo.email;
        req.session.loginInfo.fabaoId = body.userInfo.fabaoId;
        req.session.loginInfo.phone = body.userInfo.phone;
    };
};

router.post("/getsmscode", function(req, res, next) {
    apiAdapterUtil.apiUtil(req, res, "/getsmscode", function(err,body){
        if(err){
            next(err);
            return;
        }else if(body){
            console.log(body);
            res.send( {result : {success:true}, status: { code : 1, desp:"response" }});
        }else{
            var err = new Error('读取口袋看法数据失败');
            next(err);
        }
    });
});
router.post("/login", function(req, res, next) {
    apiAdapterUtil.apiUtil(req, res, "/login", function(err,body){
        if(err){
            next(err);
            return;
        }else if(body){
            setSession(req,body);
            res.send(body);
            //res.send( {loginSuccess:true});
        }else{
            var err = new Error('登录失败');
            next(err);
        }
    });
});

module.exports = router;