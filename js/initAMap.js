define(function() {
    var init = function() {
        var map = new AMap.Map('mapContainer', {
            // resizeEnable: true
        });
        AMap.service(["AMap.PlaceSearch"], function() {
            //构造地点查询类
            var placeSearch = new AMap.PlaceSearch({
                pageSize: 10, // 单页显示结果条数
                pageIndex: 1, // 页码
                datatype: "poi",
                // city: "010", // 兴趣点城市
                citylimit: true,  //是否强制限制在设置的城市内搜索
                // map: map, // 展现结果的地图实例
                // panel: "panel", // 结果列表将在此容器中进行展示。
                autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
            });

            var cpoint = [116.405467, 39.907761];
            placeSearch.searchNearBy('火车站', cpoint, 5000, function(status, result) {
                console.log(result);
            });
        });

        // AMap.plugin(["AMap.PlaceSearch"], function() {
        //     //构造地点查询类
        //     var placeSearch = new AMap.PlaceSearch({
        //         pageSize: 5, // 单页显示结果条数
        //         pageIndex: 1, // 页码
        //         // city: "010", // 兴趣点城市
        //         citylimit: true,
        //         map: map,
        //         autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
        //     });
        //     //关键字查询
        //     placeSearch.search('火车站', function (status, result) {
        //         console.log(result);
        //     });
        // });

    };
    return {
        init: init
    };
});