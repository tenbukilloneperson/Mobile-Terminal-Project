$(function () {
    new App();
});
var App = function () {
    this.page = 1;//默认第一页
    this.pageSize = 5; //一页条数
    this.$el = $('tbody');
    this.init()
};
App.prototype.init = function () {
    var that = this;
    that.render(function (data) {
        that.pagination(data);
    });
    that.dropDown();
    that.fileUpload();
    that.bindEvent();
};
App.prototype.render = function (callback) {
    var that = this;
    $.ajax({
        type: 'get',
        url: '/category/querySecondCategoryPaging',
        data: {
            page: that.page,
            pageSize: that.pageSize
        },
        dataType: 'json',
        success: function (data) {
            that.$el.html(template('list', data));
            callback && callback(data);
        }
    });
};
App.prototype.bindEvent = function () {
    var that = this;
    $('.btn-primary').on('click', function () {
        that.addCategory();
    });
};
//分页初始化
App.prototype.pagination = function (data) {
    var that = this;
    //使用一个插件 bootstrap-paginator.js 插件 github
    // <ul class="pagination"> 的容器  装分页的按钮
    // 初始化
    $('.pagination').bootstrapPaginator({
        //配置功能 也会有必填项
        //如果使用的是bootstrap 3.3.7 需要配置如下属性
        bootstrapMajorVersion: 3,
        size: 'small',
        //当前页
        currentPage: data.page,
        //一共多少页
        totalPages: Math.ceil(data.total / data.size),
        //显示页面的按钮
        numberOfPages: 10,
        //回调函数 点击分页按钮后
        onPageClicked: function (event, originalEvent, type, page) {
            //event jquery事件对象
            //originalEvent 原生的事件对象
            //type 按钮类型
            //page 当前按钮对应的页码
            that.page = page; //修改传参
            that.render();
        }
    });

};
//下拉菜单初始化
App.prototype.dropDown = function () {
    //获取顶级分类的所有数据
    $.ajax({
        type: 'get',
        url: '/category/queryTopCategoryPaging',
        data: {
            page: 1,
            pageSize: 10000
        },
        dataType: 'json',
        success: function (data) {
            $('.dropdown-menu')
                .html(template('dropDown', data))
                .on('click', 'a', function () {
                    //设置选择内容  同时设置选择的ID
                    var text = $(this).data('text');
                    var id = $(this).data('id');
                    $('.dropdown .text').html(text).data('id', id);
                })
        }
    })
};
//上传图片初始化
App.prototype.fileUpload = function () {
    //1. 下载：https://github.com/blueimp/jQuery-File-Upload
    //2. 引入：jquery.fileupload.js 依赖  jquery.ui.widget.js  依赖 jqeury.min.js
    //3. 约定HTML结构 <input type="file" name="pic1" id="fileUpload"> name="pic1"和后台需要的字段统一
    //4. 初始化  data-url="接口地址"
    $('#fileUpload').fileupload({
        //类似于ajax的参数
        url: '/category/addSecondCategoryPic',
        dataType: 'json',
        done: function (e, data) {
            var src = data.result.picAddr;
            $('.imgBox img').attr('src', src);
        }
    });
};
//添加品牌
App.prototype.addCategory = function () {
    var that = this;
    //1. 获取数据  categoryId brandName brandLogo
    var categoryId = $('.dropdown .text').data('id');
    var brandName = $('[name="brandName"]').val();
    var brandLogo = $('.imgBox img').attr('src');
    //2. 提交数据
    $.ajax({
        type:'post',
        url:'/category/addSecondCategory',
        data:{categoryId,brandName,brandLogo}, //ES6语法
        dataType:'json',
        success:function (data) {
            if(data.success){
                //3. 添加成功后 关闭模态框 且 更新列表  第一页  更新分页组件
                $('#addCategory').modal('hide');
                that.page = 1;
                that.render(function (data) {
                    that.pagination(data);
                });
            }
        }
    });
};