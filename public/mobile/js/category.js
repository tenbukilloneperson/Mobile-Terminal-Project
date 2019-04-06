$(function () {
    /*使用面向对象开发  可读性高  可维护性好 */

    /*1. 当页面初始化  加载顶级分类数据且完成渲染*/
    /*2. 当顶级分类渲染结束  根据顶级分类的第一个分类去获取二级分类的数据切完成渲染*/
    /*3. 当点击一级分类  根据当前点击的分类获取二级分类的数据切完成渲染 */
    new App();
});
var App = function () {
    //顶级分类的容器
    this.$top = $('.zt_cateLeft');
    //二级分类的容器
    this.$second = $('.zt_cateRight');
    //初始化函数
    this.init();
};
//页面初始化
App.prototype.init = function () {
    var that = this;
    that.renderTop(function (id) {
        /*这个函数就是  callback*/
        /*一级分类加载渲染完成*/
        that.renderSecond(id);
    });
    that.bindEvent();
};
//绑定事件
App.prototype.bindEvent = function () {
    //tap 是一个移动端手势事件  是touch事件封装来的  是mui封装的事件
    //tap 是一个响应速度比click要快的点击事件  click在移动设备有300ms左右的延时
    //click 在触发的时候移动设备会考虑是不是双击缩放操作 会等300ms在去触发事件
    //touchstart touchend 如果是点击只会触发这两个事件  start-end的耗时 小于300ms比click响应快
    //tap 一个在移动端比click响应速度更快的 点击事件
    var that = this;
    that.$top.on('tap','a',function () {
        //1. 切换样式
        $(this).parent().addClass('now').siblings().removeClass('now');
        //2. 渲染二级分类
        that.renderSecond(this.dataset.id);
    });
};
//渲染顶级分类
App.prototype.renderTop = function (callback) {
    var that = this;
    $.ajax({
        type: 'get',
        url: '/category/queryTopCategory',
        data: '',
        dataType: 'json',
        success: function (data) {
            //模版作用：把json对象转换成HTML格式的字符串
            /*1. 数据 data => {rows:[],total:5} */
            /*2. 结合模版进行转换  定义模版 <script type="text/template" id=""> */
            /*3. 调用 template(id,data) 获取拼接后的字符串代码*/
            /*4. 给需要渲染的容器啊*/
            /*5. 通过模版语法去动态的渲染模版*/
            /*6. 简洁语法 {{ }}   原生语法 <% js代码 %>*/
            /*7. 在模版内置使用传入的数据？ */
            /*8. $data 在模版内是一个默认的变量 指向的就是你传入的数据 */
            /*9. 当你传入的是一个对象 在模版内还可以使用 对象的属性当做变量 去操作*/
            /*10. $index 是你在遍历的过程当中 的索引*/
            /*11. $value 是你在遍历的过程当中 的对象*/
            /*12. 自定义遍历的索引和对象 each list item i*/
            that.$top.html(template('top', data));

            //二级分类渲染   一级分类加载完成
            //renderTop  渲染一级分类  可以定义回调函数
            callback && callback(data.rows[0].id);
        }
    });
};
//渲染二级分类
App.prototype.renderSecond = function (id) {
    var that = this;
    $.ajax({
        type: 'get',
        url: '/category/querySecondCategory',
        data: {id: id},
        dataType: 'json',
        success: function (data) {
            that.$second.html(template('second', data));
        }
    });
};