$(function () {
    new App();
});
/*1. 根据地址栏商品ID获取商品详情数据*/
/*2. 获取数据的过程 使用下来刷新的效果  待数据响应成功 渲染页面*/
/*3. 页面渲染完毕 初始化尺码选择*/
/*4. 页面渲染完毕 初始化数量选择*/
/*5. 加入购物车*/
var App = function () {
    //待渲染元素
    this.$el = $('.mui-scroll');
    //获取当前的ID
    this.id = zt.getParamsByUrl().productId;
    this.init();
};
App.prototype.init = function () {
    this.initPullRefresh();
    this.bindEvent();
};
//只负责获取数据
App.prototype.render = function (callback) {
    var that = this;
    $.ajax({
        type: 'get',
        url: '/product/queryProductDetail',
        data: {id: that.id},
        dataType: 'json',
        success: function (data) {
            callback && callback(data);
        }
    });
};
App.prototype.bindEvent = function () {
    var that = this;
    //绑定  选择尺码 按钮的tap事件
    that.$el.on('tap', '.pro_size span', function () {
        that.changeSize(this);
    });
    $('.btn_cart').on('tap', function () {
        that.addCart();
    });
};

App.prototype.initPullRefresh = function () {
    var that = this;
    mui.init({
        pullRefresh: {
            container: '.mui-scroll-wrapper',
            indicators: false,
            down: {
                auto: true,
                callback: function () {
                    //console.log(this == mui('.mui-scroll-wrapper').pullRefresh())
                    var pullThis = this;
                    that.render(function (data) {
                        //渲染
                        that.$el.html(template('detail', data));
                        //重新初始化轮播图
                        mui('.mui-slider').slider();
                        //初始化数量选择组件
                        mui('.mui-numbox').numbox();
                        //结束下拉刷新
                        pullThis.endPulldownToRefresh();
                    });
                }
            }
        }
    })
};
//尺码选择
App.prototype.changeSize = function (sizeBtn) {
    //获取当前点击的元素 sizeBtn
    $(sizeBtn).addClass('now').siblings().removeClass('now');
};
//数量选择
// App.prototype.changeNum = function () {
//
// };
//加入购物车
App.prototype.addCart = function () {
    //1. 获取数据  productId size num
    var productId = this.id;
    var size = $('.pro_size span.now').data('size');
    var num = mui('.mui-numbox').numbox().getValue();
    //2. 校验是否选择了尺码
    if (!size) {
        mui.toast('请选择器尺码');
        return;
    }
    //3. 发添加购物车请求
    $.ajax({
        type: 'post',
        url: '/cart/addCart',
        data: {
            productId: productId,
            size: size,
            num: num
        },
        dataType: 'json',
        success: function (data) {
            //拦截登录
            if (data.error == 400) {
                location.href = '/mobile/user/login.html?returnUrl=' + encodeURIComponent(location.href);
                return;
            }
            //如果成功
            if(data.success){
                //1. 弹出确认框
                //2. 点击确认按钮  跳转去购物车页面
                mui.confirm('亲加入成功，是否去购物车看看？','温馨提示',['取消','确认'],function (e) {
                    if(e.index == 1){
                        location.href = '/mobile/user/cart.html';
                    }
                });
            }
        }
    });
};