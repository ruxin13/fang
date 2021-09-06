require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1",
        'swiper': 'swiper.min',
    },
});
define(['common', 'jquery', 'swiper'], function (core, $, Swiper) {
    core.init();
    var modal = {
        server: {
            "dev": "//dev.xiangdao.info",
            "pro": "//www.xiangdao.info"
        }
    };
    modal.env = "dev";
    modal.videoIndexArr = [];
    modal.id = core.parseQueryString().hotelId;


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









    };




    var showAll = document.querySelectorAll(".pan-showall");
    if (showAll && showAll.length > 0) {
        for (var i = 0; i < showAll.length; i++) {
            showAll[i].addEventListener("click", function () {
                var prev = this.previousElementSibling;
                prev && prev.classList.add("showAll");
                this.style.display = "none";
            }, false);
        }
    }
    var showAll2 = document.querySelectorAll(".pan-showall2");
    if (showAll2 && showAll2.length > 0) {
        for (var m = 0; m < showAll2.length; m++) {
            showAll2[m].addEventListener("click", function () {
                var prev = this.previousElementSibling;
                if (this.dataset.switch !== "1") {
                    // open
                    this.innerText = "收起 >>";
                    this.dataset.switch = "1";
                    prev && prev.classList.add("showAll");
                } else {
                    // close
                    this.innerText = "详情 >>";
                    this.dataset.switch = "0";
                    prev && prev.classList.remove("showAll");
                }
            }, false);
        }
    }
    var linkApp = document.querySelectorAll(".link");
    if (linkApp && linkApp.length > 0) {
        for (var z = 0; z < linkApp.length; z++) {
            linkApp[z].addEventListener("click", function () {
                openApp();
            }, false);
        }
    }


    modal.init();
});