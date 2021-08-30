require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1",
        'swiper': 'swiper.min',
        // 'gearDate': '../dist/js/gearDate.min'
        'gearDate': 'gearDate'
    },
});
define(['common', 'jquery', 'swiper', 'gearDate'], function (core, $, Swiper, gearDate) {
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
    modal.parseTime = function (timestamp) {
        if (timestamp) {
            var date = new Date(timestamp);
            var y = date.getFullYear().toString().substring(2);
            var m = date.getMonth() + 1;
            var d = date.getDate();
            return y + "年" + m + "月" + d + "日"
        } else {
            return ""
        }
    };
    var swiper = new Swiper('.swiper-container-bed', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        init: false
    });
    var swiper2 = new Swiper('#nearbyScene', {
        slidesPerView: 2.3,
        spaceBetween: 10,
        init: false
    })
    modal.q = function (selector) {
        return document.querySelector(selector)
    };

    modal.init = function () {

        modal.initDate();

        var swiper1 = new Swiper('.swiper-album', {
            slidesPerView: 2.5,
            spaceBetween: 20,
            init: false
        });

        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/hotel_details/" + modal.id,
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify({"hotelId": modal.id}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var data = res.json;
                    var video = modal.q("#playVideo");
                    var imgs = modal.q("#imgList");
                    video.src = data.video;
                    video.poster = data.cover;
                    video.e(function () {
                        video.play();
                        video.st("controls", "controls")
                    });
                    // if (data.briefImages) {
                    //     var imgList = data.briefImages.split(",");
                    //     if (imgList && imgList.length > 0) {
                    //         var imgStr = '';
                    //         imgList.forEach(function (item) {
                    //             imgStr += '<div class="swiper-slide album-li" style="background-image: url('+item+')"></div>';
                    //         });
                    //         imgs.innerHTML = imgStr;
                    //         swiper1.init();
                    //     }
                    // }
                    var hotelTitle = modal.q(".hc-tit");
                    var hotelName = modal.q(".hc-inf");
                    var content = modal.q("#content");
                    var validDate = modal.q("#validDate");
                    var bookingNotice = modal.q("#bookingNotice");
                    var housePolicy = modal.q("#housePolicy");
                    var tags = modal.q(".hc-tags");
                    hotelTitle.innerText = data.hotelTitle;
                    hotelName.innerText = data.hotelName;
                    housePolicy.innerHTML = data.housePolicy;
                    content.innerHTML = data.content;
                    bookingNotice.innerHTML = data.bookingNotice;
                    if (data.hotelTagName) {
                        var tagArr = data.hotelTagName.split(",");
                        var tagStr = '';
                        tagArr.forEach(function (item) {
                            tagStr += '<div class="hc-tag">' + item + '</div>'
                        });
                        tags.innerHTML = tagStr;
                    }
                    if (data.validBeginTime && data.validEndTime && validDate) {
                        var begin = modal.parseTime(data.validBeginTime);
                        var end = modal.parseTime(data.validEndTime);
                        validDate.it(begin + "-" + end);
                    }
                }
            }
        });
    };

    modal.initDate = function () {
        var date1 = new GearDate();
        var date2 = new GearDate();
        date1.init({
            trigger: "#firstSelect",
            startInput: "#startDate",
            endInput: "#endDate",
            totalDays: "#totalDays",
            totalMonth: 12
        });
        date2.init({
            trigger: "#secondSelect",
            startInput: "#startDate2",
            endInput: "#endDate2",
            totalDays: "#totalDays2",
            totalMonth: 24
        })


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