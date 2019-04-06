//全局的命名空间  全局对象
if(!window.zt){
    window.zt = {};
}
//获取地址栏数据
//http://localhost:3000/mobile/productList.html?proName=123&proId=101
//转换成对象  {proName:123,proId:101}
zt.getParamsByUrl = function () {
    var obj = {};
    //丰富对象   插属性和对应的值
    var search = location.search;
    if(search){
        search = search.replace(/^\?/,'');
        var arr = search.split('&');
        // ["proName=123", "proId=101"]
        arr.forEach(function (item,i) {
            var itemArr = item.split('=');
            //itemArr[0]  对象属性
            //itemArr[1]  对象属性对应的值
            obj[itemArr[0]] = decodeURIComponent(itemArr[1]);
        });
    }
    return obj;
};