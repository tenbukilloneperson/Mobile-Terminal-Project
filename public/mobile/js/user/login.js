$(function () {
    //登录的业务
    $('form').on('submit',function (e) {
        e.preventDefault();
        //ajax 提交
        $.ajax({
            type:'post',
            url:'/user/login',
            data:$(this).serialize(),
            dataType:'json',
            success:function (data) {
                if(data.success){
                    //登录成功
                    var returnUrl = zt.getParamsByUrl().returnUrl;
                    //1. 有来源
                    if(returnUrl){
                        location.href = returnUrl;
                    }
                    //2. 没有来源
                    else{
                        location.href = '/mobile/user/index.html';
                    }
                }else{
                    //提示错误消息
                    mui.toast(data.message);
                }
            }
        });
    });
});