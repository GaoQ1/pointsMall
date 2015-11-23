var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require("cookie-session");
var bodyParser = require('body-parser');

var auth = require('./routes/auth');
var index = require('./routes/index');
var channel = require('./routes/channel');
var profiling = require("./routes/middleware/profiling");
var version = require("./routes/middleware/version");
var config = require("./routes/middleware/config");
var apiMiddleware = require("./adapter/api/apiAdapter");
var error = require("./routes/middleware/error");
var hbs = require('hbs');
var helper = require("./util/registerHelper");
var app = express();

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper("GetItemAt",helper.GetItemAt);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
//访问耗时拦截器
//Keymetrics 监控 node 服务器的运行状况
app.use(profiling.timer);
app.use(version.ver);
app.use(config.loadApi);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({keys:[global.CONFIG.APP,global.CONFIG.SECRET]}));

//认证
app.use('/', auth);
app.use('/', index);
app.use('/', channel);

app.use(apiMiddleware.api);

// catch 404 and forward to error handler
app.use(error.error_404);
// error handlers
// development error handler
// will print stacktrace
if (global.CONFIG.ENV === 'DEV') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(req.query.json && req.query.json == "1"){
      res.send({message: err.message,error: err.stack});
    }else{
      res.render('error', {message: err.message,error: err});
    }
  });
}
// production error handler
// no stacktraces leaked to user
app.use(error.error_500);

module.exports = app;
