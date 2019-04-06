$(function () {
    /*mui('.mui-scroll-wrapper').scroll({indicators:false});*/
    // mui.init({
    //     //对象的属性就是组件的名称
    //     pullRefresh:{
    //         //对象配置组件参数
    //         //组件容器
    //         container:'.mui-scroll-wrapper',
    //         //是否有滚动条
    //         indicators:false,
    //         /*下拉刷新的配置对象*/
    //         down:{
    //             callback:function () {
    //                 console.log('发生请求');
    //                 setTimeout(function () {
    //                     console.log('响应成功');
    //                     //结束下拉刷新
    //                     //console.log(mui('.mui-scroll-wrapper').pullRefresh());
    //                     //endPulldownToRefresh mui提供  文档有错误  注意一下
    //                     mui('.mui-scroll-wrapper').pullRefresh().endPulldownToRefresh();
    //                 },1000);
    //             }
    //         },
    //         /*上拉加载*/
    //         up:{
    //             callback:function () {
    //                 console.log('发生请求');
    //                 setTimeout(function () {
    //                     console.log('响应成功');
    //                     mui('.mui-scroll-wrapper').pullRefresh().endPullupToRefresh();
    //                 },1000);
    //             }
    //         }
    //     }
    // });
    new App();
});
/*1. 页面初始化  获取地址栏的商品名称  设置给搜索框*/
/*2. 根据商品名称 获取第一页数据 进行渲染  这个加载数据的效果是下拉刷新*/
/*3. 用户主动去下拉操作  获取第一页数据 进行渲染  替换*/
/*4. 用户主动去上拉操作  获取下一页数据 进行渲染  追加*/
/*5. 在输入框输入内容后 点击搜索  获取第一页数据 进行渲染  这个加载数据的效果是下拉刷新*/
/*6. 点击排序按钮  按照排序的类型  和 升序或降序 去进行数据的获取  下拉刷新效果*/
var App = function () {
    //从地址栏获取商品名称
    this.proName = zt.getParamsByUrl().proName;
    //获取输入框
    this.$searchInput = $('.zt_search input').val(this.proName);
    //获取搜索按钮
    this.$searchBtn = $('.zt_search a');
    //待渲染的容器
    this.$el = $('.zt_product');
    //当前加载的页码 默认是第一页
    this.page = 1;
    //一页多少条
    this.pageSize = 4;
    //排序容器
    this.$order = $('.zt_order');
    this.init();
};
App.prototype.init = function () {
    this.initPullRefresh();
    this.bindEvent();
};
App.prototype.render = function (callback) {
    //发请求 获取数据  认为是渲染  渲染的方式  替换  追加
    var that = this;
    //只有点击了排序 传参 排序的相关参数
    var obj = {
        page: that.page,
        pageSize: that.pageSize,
        proName: that.proName
    };
    if(that.orderType){
        obj[that.orderType] = that.orderValue;
    }
    $.ajax({
        type: 'get',
        url: '/product/queryProduct',
        data: obj,
        dataType: 'json',
        success: function (data) {
            //为了能够去执行不同的业务   将业务认为是一个回调函数
            callback && callback(data);
        }
    });
};
App.prototype.bindEvent = function () {
    var that = this;
    that.$searchBtn.on('tap', function () {
        that.search();
    });
    that.$order.on('tap', 'a', function () {
        that.order(this);
    });
};
//初始化上拉下拉
App.prototype.initPullRefresh = function () {
    var that = this;
    mui.init({
        pullRefresh: {
            container: '.mui-scroll-wrapper',
            indicators: false,
            down: {
                auto: true,
                //做了下拉操作就会执行
                callback: function () {
                    //console.log(this==mui('.mui-scroll-wrapper').pullRefresh())
                    //callback函数的this指向  组件的实例化对象
                    var pullThis = this;
                    that.page = 1;
                    //发请求 响应成功后结束下拉
                    that.render(function (data) {
                        //data 就是ajax返回的数据
                        //渲染 替换
                        that.$el.html(template('list', data));
                        //结束下拉
                        pullThis.endPulldownToRefresh();
                        //重新开启  上拉加载功能
                        pullThis.refresh(true);
                    });
                }
            },
            up: {
                contentnomore: '亲没数据了',
                callback: function () {
                    var pullThis = this;
                    //发请求 响应成功后结束上拉
                    that.page++;
                    that.render(function (data) {
                        //渲染 追加
                        that.$el.append(template('list', data));
                        //结束上拉
                        //1. 有数据 正常结束   再次拉取触发up配置的callback
                        //2. 没有数据  禁止再次上拉加载  提示  没有更多数据了
                        pullThis.endPullupToRefresh(!data.data.length);
                    });
                }
            }
        }
    });
};
//搜索
App.prototype.search = function () {
    var value = $.trim(this.$searchInput.val());
    if (!value) {
        mui.toast('请输入关键字');
        return;
    }
    //根据现在你输入的内容  体现下拉刷新效果  重新渲染页面
    this.proName = value;
    //去触发下拉刷新  调用callback --> render()
    //通过js的方式去调用一次下拉刷新的操作
    //console.log(mui('.mui-scroll-wrapper').pullRefresh());
    mui('.mui-scroll-wrapper').pullRefresh().pulldownLoading();
};
//排序
App.prototype.order = function (current) {
    var $current = $(current);
    //1. 样式的切换
    //1.1 点击的没有选中的按钮   给当前的加上  清除之前的选中 且  箭头默认朝下
    if (!$current.hasClass('now')) {
        $current.addClass('now').siblings().removeClass('now').find('span').attr('class', 'fa fa-angle-down');
    }
    //1.2 点击的选中的按钮   改变箭头方向
    else {
        var $span = $current.find('span');
        if ($span.hasClass('fa-angle-down')) {
            $span.attr('class', 'fa fa-angle-up');
        } else {
            $span.attr('class', 'fa fa-angle-down');
        }
    }
    //根据当前的排序类型和排序方式  去请求后台  渲染
    //给后台传参  注意：只能传一种排序  即使排序的值为空也不行
    //price使用价格排序（1升序，2降序）
    //num 产品库存排序（1升序，2降序）
    var orderType = $current.data('type');
    var orderValue = $current.find('span').hasClass('fa-angle-down') ? 2 : 1;
    //注意：只能传一种排序
    this.orderType = orderType;
    this.orderValue = orderValue;
    mui('.mui-scroll-wrapper').pullRefresh().pulldownLoading();
};

//下拉刷新效果  初始化了这个组件   区域滚动内的A链接失效
// 1. 加了一个按钮 button
// 2. a绑定事件  tap 事件  根据a的href属性 跳转