/**
 * Created by baojx on 2015/10/9.
 */
var express = require('express');
var jsonMsgFormat = require("../util/jsonMsgFormat");
var router = express.Router();
/* GET users listing. */
router.get('/socketAuth', function(req, res, next) {
    if(!req.session || !req.session.user){
        res.send(jsonMsgFormat.error("请先登录！"));
    }else{
        res.send(jsonMsgFormat.response({user:req.session.user.name}));
    }
});

module.exports = router;