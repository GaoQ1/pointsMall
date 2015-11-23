/**
 * Created by baojx on 2015/9/29.
 */
var fs = require('fs');
var path = require('path');
var express = require('express');
var loadApi = function (req, res, next) {
    if(!global.API){
        var p = path.join(__dirname, '../../adapter/api/config/apiConfig.json');
        fs.readFile(p, function(err, data) {
            var config = JSON.parse(data);
            global.API = config;
            next();
        });
    }else{
        next();
    }
}

module.exports = {
    loadApi:loadApi
}