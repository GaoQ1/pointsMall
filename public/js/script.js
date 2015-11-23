function imgDelayed() {
	$(".imgDelayed").each(function() {
		var src = $(this).attr("data-src");
		$(this).attr("src", src)
	});
};

/**
 * ---------------------- js-native bridge ------------------------------------
 */
var bridgeUserInfo = {
	accessToken:'',
	appId:'',
	token:'',
	osType:'',
	channel:'',
	appVersion:'',
	cityCode:'0',
	isKdlsAppBridge:false
};

if (typeof callActionNameEnum == "undefined") {
	var callActionNameEnum = {
		ACTION_PAGE_META: 'ACTION_PAGE_META', // 获取meta信息
		ACTION_JUMP_DETAIL: 'ACTION_JUMP_DETAIL', // 跳转详情页
		ACTION_ORDER: 'ACTION_ORDER', // 下单
		ACTION_RECHARG: 'ACTION_RECHARG', // 充值
		ACTION_ACCOUNT: 'ACTION_ACCOUNT', // 余额
		ACTION_COUPON: 'ACTION_COUPON', // 优惠券
		ACTION_ABOUT: 'ACTION_ABOUT', // 关于
		ACTION_HELP: 'ACTION_HELP', // 帮助
		ACTION_ORDER_LIST: 'ACTION_ORDER_LIST', // 订单列表
		ACTION_ORDER_DETAIL: 'ACTION_ORDER_DETAIL', // 订单详情
		ACTION_SHARE: 'ACTION_SHARE', // 分享
		ACTION_SHOW_LOADING: 'ACTION_SHOW_LOADING', // 显示欢迎页
		ACTION_LOAD_FINISH: 'ACTION_LOAD_FINISH', // 加载完成，隐藏菊花
		ACTION_NEED_LOGIN: 'ACTION_NEED_LOGIN'	// 检查App登录状态
	};
}

if (typeof registerActionNameEnum == "undefined") {
	var registerActionNameEnum = {
		ACTION_SWITCH_LIST_MODE: 'ACTION_SWITCH_LIST_MODE', // 切换页面列表模式
		ACTION_LOGIN_SUCCESS: 'ACTION_LOGIN_SUCCESS',	// App登录成功
		ACTION_APP_DATA: 'ACTION_APP_DATA'   // app用户信息
	};
}

// 获取url参数
function getCurrentUrlParam(paramName) {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	if(!isEmptyData(vars[paramName])) {
		return vars[paramName];
	}
	else {
		return '';
	}
};

var isAddedEvent = false;
function connectWebViewJavascriptBridge(callback) {
	if (window.WebViewJavascriptBridge) {
		callback(WebViewJavascriptBridge);
	} else {
		if (isAddedEvent == true) return;
		isAddedEvent = true;
		document.addEventListener('WebViewJavascriptBridgeReady', function() {
			bridgeUserInfo.isKdlsAppBridge = true;
			callback(WebViewJavascriptBridge);
		}, false);
	}
};

connectWebViewJavascriptBridge(function(bridge) {
	bridge.init(function(message, responseCallback) {
		var data = {
			'JS Responds': 'Message from H5!'
		};
		responseCallback(data);
	});

	//bridge.send("userInfo", function(responseData) {});

	// 获取meta content信息
	var metas = document.getElementsByTagName('meta');
	var page_name = '',
		mode = '',
		TITLE_SHOW = '',
		Left_mode = '',
		Right_mode = '';
	for (i = 0; i < metas.length; i++) {
		if (metas[i].getAttribute("name") == "page_name") {
			page_name = metas[i].getAttribute("content");
		} else if (metas[i].getAttribute("name") == "mode") {
			mode = metas[i].getAttribute("content");
		} else if (metas[i].getAttribute("name") == "TITLE_SHOW") {
			TITLE_SHOW = metas[i].getAttribute("content");
		} else if (metas[i].getAttribute("name") == "Left_mode") {
			Left_mode = metas[i].getAttribute("content");
		} else if (metas[i].getAttribute("name") == "Right_mode") {
			Right_mode = metas[i].getAttribute("content");
		}
	}
	var responseData = {
		'mode': mode,
		'page_name': page_name,
		'title': document.title,
		'TITLE_SHOW': TITLE_SHOW,
		'Left_mode': Left_mode,
		'Right_mode': Right_mode
	};
	bridge.callHandler(callActionNameEnum.ACTION_PAGE_META, responseData, function(response) {});

		/* -------------- 这里配置全局通用的registerHandler action -----------------*/
	// App用户信息
	bridge.registerHandler(registerActionNameEnum.ACTION_APP_DATA, function(data, responseCallback) {
		bridgeLoadUserInfo(data);
		responseCallback('1');
	});

	// 切换页面模式
	bridge.registerHandler(registerActionNameEnum.ACTION_SWITCH_LIST_MODE, function(data, responseCallback) {
		if (window.skipUrl_forward) {
			var skipUrl = skipUrl_forward();
			responseCallback(skipUrl);
		}
	});

	// App登录成功
	bridge.registerHandler(registerActionNameEnum.ACTION_LOGIN_SUCCESS, function(data, responseCallback) {
		bridgeLoadUserInfo(data);
		responseCallback('1');
		if (window.loadAfterLoginSuccess) {
			loadAfterLoginSuccess(bridgeUserInfo);
		}
	});

});

/**
 * callHandler Action
 * 调用格式：
 	var responseData = {
 		'title':'title',
 		'url':'url'
 	};
 	bridgeCallAction(callActionNameEnum.ACTION_ABOUT, responseData, function(response) {
		alert("native回调的结果：" + response);
 	});
 * actionName：枚举类型的值，格式如 callActionNameEnum.ACTION_ABOUT
 * paramJson：传入的json格式参数，如果无参数则传''，比如 {'title':'title demo','url':'http://www.baidu.com'}
 * callback：js回调结果，返回response为json格式，格式如 function(response) {}
 */
function bridgeCallAction(actionName, paramJson, callback) {
	connectWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler(actionName, paramJson, callback);
	});
}

/**
 * registerHandler Action
 * 调用格式：
 	bridgeRegisterAction(callActionNameEnum.ACTION_SWITCH_LIST_MODE, function(data, responseCallback) {
 		alert("native传过来的参数：" + data);
		var responseData = "回调给native的参数";
		responseCallback(responseData);
	});
 * actionName：枚举类型的值，格式如 callActionNameEnum.ACTION_SWITCH_LIST_MODE
 * handler：回调处理定义，格式如：function(data, responseCallback) {}
 * 		- data：native传过来的参数，json格式；
 * 		- responseCallback：回调给native的结果，数据为json格式，如 responseCallback(responseData);
 */
function bridgeRegisterAction(actionName, handler) {
	connectWebViewJavascriptBridge(function(bridge) {
		bridge.registerHandler(actionName, handler);
	});
};

// 获取用户系统信息
function bridgeLoadUserInfo(responseData)
{
	if (isEmptyData(responseData)){
		responseData = {};
	}
	else if (typeof responseData == 'string'){
		responseData = JSON.parse(responseData);
	}

	if (!isEmptyData(responseData.token)){
		bridgeUserInfo.token = responseData.token;
	}

	if (!isEmptyData(responseData.accessToken)){
		bridgeUserInfo.accessToken = responseData.accessToken;
	}

	if (!isEmptyData(responseData.appId)){
		bridgeUserInfo.appId = responseData.appId;
	}

	if (!isEmptyData(responseData.osType)){
		bridgeUserInfo.osType = responseData.osType;
	}

	if (!isEmptyData(responseData.channel)){
		bridgeUserInfo.channel = responseData.channel;
	}

	if (!isEmptyData(responseData.appVersion)){
		bridgeUserInfo.appVersion = responseData.appVersion;
	}

	if (!isEmptyData(responseData.cityCode)){
		bridgeUserInfo.cityCode = responseData.cityCode;
	}

	if (isEmptyData(bridgeUserInfo.token)){
		var token = getCurrentUrlParam('token');
		if(token != '') {
			bridgeUserInfo.token = token;
		}
	}

	if (window.loadAfterCheckUserInfo) {
		loadAfterCheckUserInfo(bridgeUserInfo);
	}
}

function isEmptyData(checkData) {
	if (checkData == '' || checkData == null || checkData == undefined || checkData == 'undefined'){
		return true;
	}
	else {
		return false;
	}
}

// 检查App登录
function bridgeCheckAppLogin(callBack)
{
	bridgeCallAction(callActionNameEnum.ACTION_NEED_LOGIN, '', function(response) {
		if (callBack) {
			callBack(response);
		}
	});
}