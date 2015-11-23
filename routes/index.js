var express = require('express');
var router = express.Router();
var apiAdapterUtil = require('../adapter/api/util/apiAdapterUtil');
var request = require('request');

/* GET home page. */
/*router.get('/', function(req, res, next) {
  req.query.page = 1;
  apiAdapterUtil.apiUtil(req, res, "/pocketlaw", function(err,body){
    if(err){
      next(err);
      return;
    }else if(body){
      body.KanFaList = body.KanFaList.slice(0,4);
      res.render("index", body);
    }else{
      var err = new Error('读取口袋看法数据失败');
      next(err);
    }
  });
});*/

router.get(/^\/pocketlaw?(?:(\d+))?\.html/, function(req, res, next) {
  req.query.page = req.params && req.params[0]?req.params[0] : 1;
  console.log('cmslist page: ' + req.query.page);
  apiAdapterUtil.apiUtil(req, res, "/pocketlaw", function(err,body){
    if(err){
      next(err);
      return;
    }else if(body){
      body["pageTitle"] = "法宝-口袋律师-口袋看法";
      body["page"] = Number(req.query.page);
      res.render("pocketlaw", body);
    }else{
      var err = new Error('读取口袋看法数据失败');
      next(err);
    }
  });
});

router.get(/^\/lawdetail?(?:(\d+))?\.html/, function(req, res, next) {
  req.query.articleid = req.params && req.params[0]?req.params[0] : 0;
  apiAdapterUtil.apiUtil(req, res, "/lawdetail", function(err,body){
    if(err){
      next(err);
      return;
    }else if(body){
      body["pageTitle"] = body.title;
      res.render("lawdetail", body);
    }else{
      var err = new Error('读取口袋看法数据失败');
      next(err);
    }
  });
});


module.exports = router;