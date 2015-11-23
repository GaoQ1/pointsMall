/**
 * Created by baojx on 2015/10/8.
 * 控制版本号和一些静态资源的域名信息
 */
var ver = function (req, res, next) {
    var _render = res.render;
    res.render = function () {
        if(arguments.length > 1){
            //统一添加版本号
            arguments[1]["version"] = global.CONFIG.VER;
            arguments[1]["static"] = global.CONFIG.STATIC;
        }
        return _render.apply(res, arguments);
    };
    next();
}

module.exports = {
    ver:ver
}