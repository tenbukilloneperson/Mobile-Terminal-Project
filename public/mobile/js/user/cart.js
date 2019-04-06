$(function () {
    window.app = new App();
});
var App = function () {
    this.$el = $('.mui-scroll');
    this.init();
};
App.prototype.init = function () {
    this.initPullRefresh();
    this.bindEvent();
};
App.prototype.initPullRefresh = function () {
    var that = this;
    //初始化下拉刷新
    mui.init({
        /*配置组件*/
        pullRefresh: {
            /*组件的配置*/
            container: '.mui-scroll-wrapper',
            indicators: false,
            //下拉配置
            down: {
                auto: true,
                callback: function () {
                    var pullThis = this;
                    //默认初始化执行一次   触发了下拉操作使用callback
                    that.render(function (data) {
                        //渲染
                        that.$el.html(template('cart', {cartList: data}));
                        //结束下拉
                        pullThis.endPulldownToRefresh();
                    });
                }
            }
        }
    });
};
App.prototype.render = function (callback) {
    var that = this;
    //获取数据
    $.ajax({
        type: 'get',
        url: '/cart/queryCart',
        data: '',
        dataType: 'json',
        success: function (data) {
            //拦截登录
            if (data.error == 400) {
                location.href = '/mobile/user/login.html?returnUrl=' + encodeURIComponent(location.href);
                return;
            }
            //缓存初始化的购物车列表数据
            that.cartList = data;
            callback && callback(that.cartList);
        }
    });
};
App.prototype.bindEvent = function () {
    //刷新操作
    $('.fa-refresh').on('tap', function () {
        //主动触发一次下拉刷新   通过JS调用组件方法
        mui('.mui-scroll-wrapper').pullRefresh().pulldownLoading();
    });
    //通过$el去代理
    var that = this;
    that.$el.on('tap', '.fa-edit', function () {
        that.edit(this);
    }).on('tap', '.fa-trash', function () {
        that.delete(this);
    }).on('change', 'input[type="checkbox"]', function () {
        var product = that.cartList[this.dataset.index];//对应商品数据
        product.isChecked = $(this).prop('checked'); //获取布尔类型的属性值  true false
        that.calcAmount();
    });
};
//编辑商品
App.prototype.edit = function (editBtn) {
    var that = this;
    //1. 弹出对话框  静态HTML的即可
    //2. 根据当前对应的商品数据  渲染对话框内容
    var product = that.cartList[editBtn.dataset.index];
    //3. 初始化 尺码选择 数量选择
    //4. 把选择好的数据 提交给后台  进行修改
    //5. 响应成功且修改成功   刷新页面信息  提示语
    var html = template('edit', product).replace(/\n/g, ''); //\n会被替换成<br>
    mui.confirm(html, '编辑商品', ['取消', '确认'], function (e) {
        if (e.index == 1) {
            var size = $('.pro_size span.now').data('size');
            var num = mui('.mui-numbox').numbox().getValue();
            $.ajax({
                type: 'post',
                url: '/cart/updateCart',
                data: {
                    id: product.id,
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
                    //业务成功
                    if (data.success) {
                        //更新页面内容
                        //先更新缓存数据
                        product.size = size;
                        product.num = num;
                        //根据缓存的数据渲染页面
                        that.$el.html(template('cart', {cartList: that.cartList}));
                        //提示
                        mui.toast('编辑成功');
                        //计算金额
                        that.calcAmount();
                    }
                }
            });
        }
    });
    //内容渲染完毕  初始化一定需要在渲染完毕之后
    $('.pro_size span').on('tap', function () {
        $(this).addClass('now').siblings().removeClass('now');
    });
    mui('.mui-numbox').numbox();
};
//删除商品
App.prototype.delete = function (delBtn) {
    var that = this;
    var product = that.cartList[delBtn.dataset.index];
    /*1. 弹窗提示*/
    /*2. 点击确认 发删除请求*/
    /*3. 业务成功 更新列表*/
    mui.confirm('亲您确认删除该商品吗？', '删除商品', ['取消', '确认'], function (e) {
        if (e.index == 1) {
            $.ajax({
                type: 'get',
                url: '/cart/deleteCart',
                data: {
                    id: product.id,
                },
                dataType: 'json',
                success: function (data) {
                    //拦截登录
                    if (data.error == 400) {
                        location.href = '/mobile/user/login.html?returnUrl=' + encodeURIComponent(location.href);
                        return;
                    }
                    if (data.success) {
                        //删除缓存中的数据
                        that.cartList.splice(delBtn.dataset.index, 1);
                        //更新列表
                        that.$el.html(template('cart', {cartList: that.cartList}));
                        //提示
                        mui.toast('删除成功');
                        //计算金额
                        that.calcAmount();
                    }
                }
            })
        }
    });
};
//设置总金额
App.prototype.calcAmount = function () {
    //选择复选框的时候  删除  编辑
    //1. 思路：$('input[type="checkbox"]:checked')  获取所有的被选中的复选框
    //2. 遍历获取的 所有的复选框  根据索引或者ID 去获取对象的商品数据
    //3. 遍历app.cartList如果id和数据的ID一致  获取商品数据
    //4. 能不能一次遍历  金额计算完毕
    var amount = 0;
    this.cartList.forEach(function (item, i) {
        if (item.isChecked) {
            amount += item.num * item.price;
        }
    });
    $('.zt_amount span').html('订单总额：¥' + amount.toFixed(2));
};