require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1"
    },
});
define(['common', 'jquery'], function (core, $) {
    core.init();
    var modal = {
        server: {
            "dev": "//dev.xiangdao.info",
            "pro": "//www.xiangdao.info"
        }
    };
    modal.env = "dev";
    modal.orderNo = core.parseQueryString().orderNo;
    function q (selector) {
        return document.querySelector(selector)
    }
    function lockBg() {
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var body = document.body;
        var style = body.style;
        style.position = "fixed";
        style.top = -scrollTop + "px";
        style.left = "0";
        style.right = "0";
        style.bottom = "0";
        body.dataset.st = scrollTop.toString();
    }
    function unLockBg(scrollTop) {
        document.body.style.position = "static";
        window.scroll(0, scrollTop ? scrollTop : document.body.dataset.st);
    }

    modal.init = function () {

        modal.getData();


    };

    modal.getData = function () {
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/user_order/user_order_details/" + modal.orderNo,
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify({"orderNo": modal.orderNo}),
            success: function (res) {
                console.log(res);
                var data = res.json;
            }
        })
    };


    modal.init();
});