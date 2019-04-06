$(function () {
    /*1. 初始化  获取存储的搜索记录  渲染列表内容*/
    /*2. 当点击搜索按钮*/
    /*2.1 当用户没有输入内容 给提示*/
    /*2.2 如果输入的内容  和之前有一样的  删除之前的  追加上去*/
    /*2.3 如果输入条数超过了10条  把第一跳删除   追加上去*/
    /*2.4 正常追加*/
    /*2.5 发生跳转 去商品列表页面 需要把搜索的数据传递下一个页面*/
    /*3. 点击删除  删除对应的历史记录 更新列表*/
    /*4. 点击清空  删除所有的历史记录 更新列表*/
    new App();
});
var App = function () {
    //待渲染的容器
    this.$el = $('.zt_history');
    //搜索按钮
    this.$searchBtn = $('.zt_search a');
    //搜索框
    this.$searchInput = $('.zt_search input').val('');
    //依赖数据 存储在本地 localStorage
    //约定：key zt_history_56  value ["a","b"]
    this.KEY = 'zt_history_56';
    //类型 数组
    this.list = JSON.parse(localStorage.getItem(this.KEY) || '[]');
    this.init();
};
App.prototype.init = function () {
    this.render();
    this.bindEvent();
};
App.prototype.render = function () {
    this.$el.html(template('history', {rows: this.list,euc:encodeURIComponent}));
};
App.prototype.bindEvent = function () {
    var that = this;
    that.$searchBtn.on('tap', function () {
        that.push();
    });
    that.$el.on('tap', 'li span', function () {
        that.delete(this.dataset.index);
    }).on('tap', '.clear', function () {
        that.clear();
    });

};
App.prototype.push = function () {
    var value = $.trim(this.$searchInput.val()); //$.trim() 提供的工具函数  去除两侧空格
    if (!value) {
        mui.toast('请输入关键字');
        return;
    }
    //1. 相同的
    var isSame = false;
    var sameIndex = null;
    this.list.forEach(function (item, i) {
        if (item == value) {
            isSame = true;
            sameIndex = i;
        }
    });
    if (isSame) {
        //删除之前
        this.list.splice(sameIndex, 1);
    }
    //2. 超过10条
    else if (this.list.length >= 10) {
        //删除第一条
        this.list.splice(0, 1);
    }
    //3. 正常
    //追加
    this.list.push(value);
    //操作的是内存中的变量  持久化  存储起来
    localStorage.setItem(this.KEY, JSON.stringify(this.list));
    //跳转
    // 把字符串转换成 URL 编码  encodeURIComponent()
    // 把URL 编码换成 字符串  decodeURIComponent()
    location.href = 'productList.html?proName=' + encodeURIComponent(value);
};
App.prototype.delete = function (index) {
    this.list.splice(index, 1);
    localStorage.setItem(this.KEY, JSON.stringify(this.list));
    this.render();
};
App.prototype.clear = function () {
    this.list = [];
    localStorage.setItem(this.KEY, JSON.stringify(this.list));
    this.render();
};