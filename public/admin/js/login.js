$(function () {
    $('#loginForm').on('submit',function (e) {
        e.preventDefault();
        //ajax提交
        $.ajax({
            type:'post',
            url:'/employee/employeeLogin',
            data:$(this).serialize(),
            dataType:'json',
            success:function (data) {
                if(data.success){
                    location.href = '/admin/index.html';
                }else{
                    $('#message').html(data.message);
                }
            }
        });
    })
});