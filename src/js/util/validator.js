/**
 * Created by baojx on 2015/10/12.
 */
var login = function(){
    var loginHandler = function(option){
        var config = {
            verifyContainer:"#verifyPhone",
            btnDisableClass:"bgGray",
            btnLabel:"获取验证码",
            phoneVerifyUrl:"/getsmscode?json=1",
            imageVerifyUrl:"/imgcode?json=1",
            showImgCaptcha:true,
            imageCaptchaUrl:"",
            loginUrl:"login?json=1",
            phoneErrHandler:function(){
                alert("手机号格式错误");
            },
            onCaptchError:function(){

            },
            onCaptchSuccess:function(){

            },
            onClearCaptchInfo:function(){

            },
            loginSuccessHandler:function(){
                alert("登录成功");
            }
        };
        utility.extend(config, option);
        var phoneInput, phoneCodeContainer, phoneCodeText, getPhoneCodeBtn,
            imageCodeContainer, imageCode, imageCodeText,
            phoneNumber, imageCodeValue,
            loginBtn;
        loginBtn = $(config.verifyContainer + " .loginBtn");
        phoneInput = $(config.verifyContainer + " .phone");
        phoneCodeContainer = $(config.verifyContainer + " .phoneCodeContainer");
        phoneCodeText = $(config.verifyContainer + " .phoneCodeText");
        getPhoneCodeBtn = $(config.verifyContainer + " .getPhoneCodeBtn");
        var httpService = http();
        var num = 0;
        var getCaptchaImageSrc = function(){
            num++;
            if(imageCodeText){
                imageCodeText.val("");
            }
            imageCode.attr("src",config.imageCaptchaUrl + "?phone=" + phoneInput.val() + "&num=" + num);
        };

        if(config.showImgCaptcha){
            imageCodeContainer = $(config.verifyContainer + " .imageCodeContainer");
            imageCode = $(config.verifyContainer + " .imageCode");
            imageCodeText = $(config.verifyContainer + " .imageCodeText");
            phoneCodeContainer.hide();
            if (phoneInput.val().match(/^1[3|4|5|6|7|8|9]\d{9}$/)) {
                phoneNumber = phoneInput.val();
                imageCodeContainer.show();
                imageCode.attr("src","");
                getCaptchaImageSrc();
            }else{
                imageCodeContainer.hide();
            }
            imageCode.on("click", function(){
                imageCode.attr("src","");
                getCaptchaImageSrc();
            });
            imageCodeText.on("input propertychange", function(){
                if(imageCodeValue != imageCodeText.val()) {
                    imageCodeValue = imageCodeText.val();
                }
                if(imageCodeValue.length > 4){
                    config.onCaptchError();
                }else if(imageCodeValue.length == 4){
                    httpService.post(config.imageVerifyUrl, {imgCode: imageCodeValue, phone: phoneNumber}, function(data){
                        if (data.code == "0000") {
                            //通过信息验证
                            config.onCaptchSuccess();
                            imageCodeContainer.hide();
                            phoneCodeContainer.show();
                            getPhoneCodeBtn.html(config.btnLabel).removeClass(config.btnDisableClass).prop('disabled', false);
                            phoneCodeText.val("");
                        } else {
                            config.onCaptchError();
                        }
                    });
                }else{
                    config.onClearCaptchInfo();
                }
            });
        }else{
            imageCodeContainer = $(config.verifyContainer + " .imageCodeContainer");
            if(imageCodeContainer)imageCodeContainer.hide();
        }

        phoneInput.on("input propertychange", function(){
            if(phoneNumber != phoneInput.val()){
                phoneNumber = phoneInput.val();
                phoneCodeText.val("");
                if(config.showImgCaptcha){
                    imageCodeText.val("");
                    phoneCodeContainer.hide();
                    if (phoneNumber.match(/^1[3|4|5|6|7|8|9]\d{9}$/)) {
                        imageCodeContainer.show();
                        imageCode.attr("src","");
                        getCaptchaImageSrc();
                    }else{
                        imageCodeContainer.hide();
                    }
                }
            }
        });

        getPhoneCodeBtn.on("click", function(){
            if (!phoneInput.val().match(/^1[3|4|5|6|7|8|9]\d{9}$/)) {
                config.phoneErrHandler();
            } else {
                getPhoneCodeBtn.addClass(config.btnDisableClass);
                httpService.post(config.phoneVerifyUrl, {type: 1, phone: phoneInput.val()}, function(data){
                    var time = 60;
                    getPhoneCodeBtn.html(time + " 秒").prop('disabled', true);
                    var t = setInterval(function() {
                        if (time > 1) {
                            time -= 1;
                            getPhoneCodeBtn.html(time + " 秒");
                        } else {
                            clearInterval(t);
                            getPhoneCodeBtn.html(config.btnLabel).removeClass(config.btnDisableClass).prop('disabled', false);
                        }
                    }, 1000);
                });

            }
        });

        loginBtn.on("click", function(){
            httpService.post(config.loginUrl, {verifyCode:phoneCodeText.val(),userName:phoneInput.val(),loginType:"1"}, function(data){
                config.loginSuccessHandler();
            });
        });
    };

    return {
        loginHandler:loginHandler
    };
}();