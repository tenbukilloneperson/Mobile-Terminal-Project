$(function () {
    /*1.侧边栏显示隐藏*/
    $('[data-menu]').on('click',function () {
        $('aside').toggle();
        $('section').toggleClass('menu');
    });
    /*2.菜单的滑入滑出*/
    $('.menu a[href="javascript:;"]').on('click',function () {
        $(this).next('div').slideToggle();
    });
    /*3.进度条显示 结束*/
    $(window).ajaxStart(function () {
        //所有的ajax都会触发这个事件
        NProgress.start();
    });
    $(window).ajaxStop(function () {
        //ajax停止触发这个事件
        NProgress.done();
    });
    /*4. 退出*/
    $('.btn-danger').on('click',function () {
        $.ajax({
            type:'get',
            url:'/employee/employeeLogout',
            data:'',
            dataType:'json',
            success:function (data) {
                if(data.success){
                    location.href = '/admin/login.html';
                }
            }
        })
    });
});