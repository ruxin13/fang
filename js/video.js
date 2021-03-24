require.config({
    paths: {
        'common': 'common.min',
        'swiper': 'swiper.min',
        'jquery': "jquery-3.2.1",
        'amap': "https://webapi.amap.com/maps?v=2.0&key=1acf89333f048989b606d856cba42d2d&callback=onAMapLoaded",
    }
});

define(['common', 'swiper', 'jquery'], function (core, Swiper, $) {
    core.init();
    var modal = {
        s: ["", "栋", "间", "套", "人"]
    };


    modal.env = "dev";


    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };

    modal.parseDate = function(timestamp) {
        var date = new Date(timestamp);
        return ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()) + " " +
            (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours()) + ":" +
            (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes())
    };
    modal.swapArray = function(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };
    modal.q = function(selector) {
        return document.querySelector(selector)
    };
    modal.id = core.parseQueryString().id;
    var swiper1 = new Swiper('.swiper-album', {
        slidesPerView: 2.5,
        spaceBetween: 20,
        init: false
    });



    core.request({
        url: modal.server[modal.env] + "/xiangdao-api/api/news/village_details/" + modal.id,
        method: "GET",
        success: function (res) {
            console.log(res);
            var data = res.json;
            modal.locationCity = data.locationCity;
            modal.locationDetail = data.locationDetail;
            modal.locationProvinceName = data.locationProvinceName;
            modal.locationCityName = data.locationCityName;
            modal.locationTownName = data.locationTownName;
            var video = modal.q("#playVideo");
            var imgs = modal.q("#imgList");
            var contentTitle = modal.q(".contentTitle");
            var contentSTitle = modal.q(".contentSTitle");
            var contentContent = modal.q(".contentContent");
            var likeCount = modal.q("#likeCount");

            video.src = data.video;
            video.poster = data.videoGif;
            if (data.briefImages) {
                var imgList = data.briefImages.split(",");
                if (imgList && imgList.length > 0) {
                    var imgStr = '';
                    imgList.forEach(function (item) {
                        imgStr += '<div class="swiper-slide album-li" style="background-image: url('+item+')"></div>';
                    });
                    imgs.innerHTML = imgStr;
                    swiper1.init();
                }
            }
            contentTitle.innerText = data.villageName;
            contentSTitle.innerText = data.lookNumber ? (data.lookNumber + "人观看") : "";
            likeCount.innerText = data.likeCount;
            contentContent.innerHTML = data.content;

            if (data.villageId) {
                $.ajax({
                    url: modal.server[modal.env] + "/xiangdao-api/api/house/house_list",
                    method: "POST",
                    dataType: "json",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        "villageId": data.villageId, "pageSize": 20
                    }),
                    success: function (res3) {
                        console.log(res3);
                        if (res3.status === 0) {
                            var list = res3.json.result;
                            if (list && list.length > 0) {
                                var vpStr = '';
                                list.forEach(function (item) {
                                    vpStr += '<div class="vp-li" data-id="'+item.houseId+'">\n' +
                                        '                <img class="vp-l" src="'+item.infoCover+'" alt />\n' +
                                        '                <div class="vp-r">\n' +
                                        '                    <div class="vp-st">'+item.profileStr+'</div>\n' +
                                        '                    <div class="vp-ti">'+item.infoTitle+'</div>\n' +
                                        '                    <div class="vp-price"><span>￥<i>'+item.ruleMonthMoney+'</i></span>'+(item.profileRentMode ? ('/'+modal.s[item.profileRentMode]):'')+'/月</div>\n' +
                                        '                </div>\n' +
                                        '            </div>'
                                });
                                modal.q(".vp-list").innerHTML = vpStr;
                                if (list.length === 1) {
                                    modal.q(".vp-list").style.height = "2.32rem";
                                    modal.q(".show-all").style.display = "none";
                                } else if (list.length === 2){
                                    modal.q(".show-all").style.display = "none";
                                    modal.q(".vp-list").style.height = "5.6rem"
                                } else {
                                    modal.q(".vp-list").style.height = "5.6rem"
                                }
                                $(".vp-li").on("click", function () {
                                    var id = $(this).data("id");
                                    location.href = "house_details.html?houseId=" + id
                                });
                            } else {
                                modal.q(".vp-wrap").style.display = "none"
                            }
                        }

                    }
                });
            }

            if (data.villageIcon) {
                core.request({
                    url: modal.server[modal.env] + "/xiangdao-api/api/houseEditor/get_house_icon_group",
                    success: function (res2) {
                        console.log(res2);
                        var insData = res2.json;
                        if (insData && insData.length > 0) {
                            var html = '';
                            var videoIcon = data.villageIcon.split(",");
                            insData = modal.swapArray(insData, 0, 1);
                            insData.forEach(function (item) {
                                html += '<div class="ist" data-id="'+item.type+'">\n' +
                                    '                <div class="ist-l">\n' +
                                    '                    <img class="ist-icon" src="'+item.typeUrl+'" alt/>\n' +
                                    '                    <div class="ist-text">'+item.typeName+'</div>\n' +
                                    '                </div>\n' +
                                    '                <div class="ist-r">\n';
                                var istStr = '';
                                item.list.forEach(function (item2) {
                                    var isSel = false;
                                    if (videoIcon && videoIcon.length > 0) {
                                        videoIcon.forEach(function (item3) {
                                            var tmpArr = item3.split("-");
                                            if (tmpArr[0] == item.type && tmpArr[1] == item2.iconSeq) {
                                                isSel = true;
                                            }
                                        });
                                    }
                                    if (isSel) {
                                        istStr += '<div class="ist-li '+(isSel ? 'sel':'')+'" data-id="'+item2.iconSeq+'">'+item2.iconName+'</div>';
                                    }
                                });
                                html += istStr;
                                html += '</div></div>'
                            });
                            var insWrap = modal.q("#insWrap");
                            insWrap.innerHTML = html;
                            var istR = document.querySelectorAll(".ist");
                            var tmpArr = [];
                            if (istR && istR.length > 0) {
                                for (var m=0;m<istR.length;m++) {
                                    var len = $(istR[m]).find(".ist-li").length;
                                    if (len === 0) {
                                        tmpArr.push($(".ist").eq(m))
                                    }
                                }
                                if (tmpArr.length > 0) {
                                    tmpArr.forEach(function (item) {
                                        item.remove();
                                    })
                                }
                                var needId = [2, 3, 5];
                                var totalHeight = 0;
                                var ins = insWrap.querySelectorAll(".ist");
                                if (ins.length < 4) {
                                    $("#insMore").hide();
                                }
                                needId.forEach(function (item) {
                                    ins.forEach(function (item2) {
                                        if (item === parseInt(item2.dataset.id)) {
                                            totalHeight += item2.clientHeight
                                        }
                                    });
                                });
                                insWrap.style.height = totalHeight + "px";
                                console.log(totalHeight);
                            } else {
                                $("#insMore").parents(".pan").hide();
                            }



                        }
                    }
                });
            } else {
                $("#insMore").parents(".pan").hide();
            }


            $.ajax({
                url: modal.server[modal.env] + "/xiangdao-api/api/news/comment_list",
                method: "POST",
                dataType: "json",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({"bizId": parseInt(modal.id), "bizType": 1, "pageNo": 1}),
                success: function (res3) {
                    console.log(res3);
                    var commentList = res3.json.result;
                    var html2 = '';
                    if (commentList && commentList.length > 0) {
                        modal.q("#totalCount").innerText = " · " + res3.json.totalCount;
                        commentList.forEach(function (item) {
                            var imagesHtml = '';
                            var replyHtml = '';
                            var funHtml = '';
                            if (item.images) {
                                imagesHtml += '<div class="cli-imgs">\n';
                                var images = item.images.split(",");
                                if (images && images.length > 0) {
                                    images.forEach(function (item2) {
                                        imagesHtml += '<img class="cli-img" src="'+item2+'" alt />'
                                    })
                                }
                                imagesHtml += '</div>\n';
                            }
                            if (item.list && item.list.length > 0) {
                                replyHtml += '<div class="cli-reply">\n';
                                item.list.forEach(function (item3) {
                                    replyHtml +=
                                        '                        <div class="clr-li">\n' +
                                        '                            <img class="clr-l" src="'+item3.avatar+'" alt />\n' +
                                        '                            <div class="clr-r">\n' +
                                        '                                <div class="clr-name">'+item3.nickName+'</div>\n' +
                                        '                                <div class="clr-cont">'+(item3.parentNickName ? ('回复'+item3.parentNickName+': '):'')+item3.content+'</div>\n' +
                                        '                                <div class="clr-fun">\n' +
                                        '                                    <div class="clr-fl">'+modal.parseDate(item3.createDate)+'</div>\n' +
                                        '                                    <div class="clr-fr">\n' +
                                        '                                        <div class="clrr-li link">\n' +
                                        '                                            <img class="clrr-icon" src="img/icon_reply.png" alt />\n' +
                                        '                                            <div class="clrr-text">回复</div>\n' +
                                        '                                        </div>\n' +
                                        '                                        <div class="clrr-li link">\n' +
                                        '                                            <img class="clrr-icon" src="img/praise.png" alt />\n' +
                                        '                                            <div class="clrr-text">'+(item3.isLike ? '已点赞' : '点赞')+'</div>\n' +
                                        '                                        </div>\n' +
                                        '                                    </div>\n' +
                                        '                                </div>\n' +
                                        '                            </div>\n' +
                                        '                        </div>\n'
                                });
                                replyHtml += '                    </div>';
                            }
                            funHtml += '<div class="cli-fun">\n' +
                                '                        <div class="cf-l">'+modal.parseDate(item.createDate)+'</div>\n' +
                                '                        <div class="cf-r">\n' +
                                '                            <div class="cf-ri link">\n' +
                                '                                <img class="cfr-icon" src="img/icon_reply.png" alt />\n' +
                                '                                <div class="cfr-text">'+(item.childCommentCount ? item.childCommentCount:'回复')+'</div>\n' +
                                '                            </div>\n' +
                                '                            <div class="cf-ri link">\n' +
                                '                                <img class="cfr-icon" src="img/praise.png" alt />\n' +
                                '                                <div class="cfr-text">'+(item.likeCount ? item.likeCount : '点赞')+'</div>\n' +
                                '                            </div>\n' +
                                '                        </div>\n' +
                                '                    </div>';
                            html2 += '<div class="cli">\n' +
                                '                <img class="cli-l" src="'+item.avatar+'" alt />\n' +
                                '                <div class="cli-r">\n' +
                                '                    <div class="cli-name">'+item.nickName+'<img class="cli-report link" src="img/icon_alarm.png" alt /></div>\n' +
                                '                    <div class="cli-txt">'+item.content+'</div>\n' +
                                imagesHtml +
                                replyHtml +
                                funHtml +
                                '                </div>\n' +
                                '            </div>'

                        })
                    } else {
                        html2 += '<div class="comment-nodata">' +
                            '<img class="comment-nodata-icon" src="img/comment_nodata.png" alt />' +
                            '<div class="comment-nodata-tit">暂无消息</div>' +
                            '<div class="comment-nodata-stit">暂时还没收到任何消息</div></div>';
                    }
                    modal.q(".com-list").innerHTML = html2;
                    var linkApp = document.querySelectorAll(".link");
                    if (linkApp && linkApp.length > 0) {
                        for (var z=0;z<linkApp.length;z++) {
                            linkApp[z].addEventListener("click", function () {
                                openApp();
                            }, false);
                        }
                    }
                }
            })

        }
    });




    var showAll = document.querySelectorAll(".pan-showall");
    if (showAll && showAll.length > 0) {
        for (var i=0;i<showAll.length;i++) {
            showAll[i].addEventListener("click", function () {
                var prev = this.previousElementSibling;
                prev && prev.classList.add("showAll");
                this.style.display = "none";
            }, false);
        }
    }
    var $showAll = $(".show-all");
    $showAll.on("click", function () {
        var $this = $(this);
        if ($this.hasClass("cols")) {
            $this.removeClass("cols").find("span").text("收起");
            $this.prev(".vp-list").addClass("showAll");
            // $("#insWrap").removeAttr("style");
        } else {
            $this.addClass("cols").find("span").text("展开");
            $this.prev(".vp-list").removeClass("showAll")
        }
    });
    var linkApp = document.querySelectorAll(".link");
    if (linkApp && linkApp.length > 0) {
        for (var z=0;z<linkApp.length;z++) {
            linkApp[z].addEventListener("click", function () {
                openApp();
            }, false);
        }
    }

    window.onAMapLoaded = function() {
        var map = new AMap.Map("mapContainer", {zoom: 11,});
        var geocoder = new AMap.Geocoder();
        // geocoder.getLocation(modal.locationDetail, function(status, result) {

        geocoder.getLocation(modal.locationProvinceName+modal.locationCityName+modal.locationTownName, function(status, result) {
            if (status === 'complete'&&result.geocodes.length) {
                var lnglat = result.geocodes[0].location;
                map.setCenter([lnglat.lng, lnglat.lat]);
                modal.lng = lnglat.lng;
                modal.lat = lnglat.lat;
                var marker = new AMap.Marker({
                    icon: "/h5/img/pos.png",
                    position: [lnglat.lng, lnglat.lat],
                    anchor:'bottom-center'
                });
                map.add(marker);

                AMap.plugin(["AMap.PlaceSearch"], function() {
                    var placeSearch = new AMap.PlaceSearch({
                        pageSize: 6, // 单页显示结果条数
                        pageIndex: 1, // 页码
                        datatype: "poi",
                        city: modal.locationCity,
                        citylimit: true,  //是否强制限制在设置的城市内搜索
                        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
                    });

                    placeSearch.searchNearBy('火车站', [lnglat.lng, lnglat.lat], 100000, function(status, result) {
                        var railwayStation = modal.q("#railwayStation");
                        if (result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                            var list = result.poiList.pois;
                            var str = '';
                            list.forEach(function (item) {
                                str +=
                                    '<div class="swiper-slide mrr-li">\n' +
                                    '     <div class="mrr-tit">'+item.name+'</div>\n' +
                                    '     <div class="mrr-des">房源距离'+(item.distance/1000) + '公里' +'</div>\n' +
                                    '</div>';
                            });
                            railwayStation.innerHTML = str;
                            var swiper5 = new Swiper('.s-crh', {
                                slidesPerView: 'auto',
                                spaceBetween: 30,
                            });
                        } else {
                            railwayStation.parentNode.parentNode.parentNode.style.display = "none"
                        }
                    });
                    placeSearch.searchNearBy('汽车站', [lnglat.lng, lnglat.lat], 100000, function(status, result) {
                        var busStation = modal.q("#busStation");
                        if (result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                            var list = result.poiList.pois;
                            var str = '';
                            list.forEach(function (item) {
                                str +=
                                    '<div class="swiper-slide mrr-li">\n' +
                                    '     <div class="mrr-tit">'+item.name+'</div>\n' +
                                    '     <div class="mrr-des">房源距离'+(item.distance/1000) + '公里' +'</div>\n' +
                                    '</div>';
                            });
                            busStation.innerHTML = str;
                            var swiper4 = new Swiper('.s-bus', {
                                slidesPerView: 'auto',
                                spaceBetween: 30,
                            });
                        } else {
                            busStation.parentNode.parentNode.parentNode.style.display = "none";
                        }
                    });
                    // placeSearch.searchNearBy('机场', [lnglat.lng, lnglat.lat], 100000, function(status, result) {
                    //     var airport = document.querySelector("#airport");
                    //     if (result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                    //         var list = result.poiList.pois;
                    //         var str = '';
                    //         list.forEach(function (item) {
                    //             str +=
                    //                 '<div class="swiper-slide mrr-li">\n' +
                    //                 '     <div class="mrr-tit">'+item.name+'</div>\n' +
                    //                 '     <div class="mrr-des">房源距离'+(item.distance/1000) + '公里' +'</div>\n' +
                    //                 '</div>';
                    //         });
                    //         airport.innerHTML = str;
                    //         var swiper3 = new Swiper('.s-airport', {
                    //             slidesPerView: 'auto',
                    //             spaceBetween: 30,
                    //         });
                    //     } else {
                    //         airport.parentNode.parentNode.parentNode.style.display = "none";
                    //     }
                    // });
                    placeSearch.searchNearBy('高速路口', [lnglat.lng, lnglat.lat], 100000, function(status, result) {
                        var crossing = modal.q("#crossing");
                        if (result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                            var list = result.poiList.pois;
                            var str = '';
                            list.forEach(function (item) {
                                str +=
                                    '<div class="swiper-slide mrr-li">\n' +
                                    '     <div class="mrr-tit">'+item.name+'</div>\n' +
                                    '     <div class="mrr-des">房源距离'+(item.distance/1000) + '公里' +'</div>\n' +
                                    '</div>';
                            });
                            crossing.innerHTML = str;
                            var swiper2 = new Swiper('.s-crossing', {
                                slidesPerView: 'auto',
                                spaceBetween: 30,
                            });
                        } else {
                            crossing.parentNode.parentNode.parentNode.style.display = "none";
                        }
                    });
                });


            } else {
                console.log('获取经纬度失败');
            }
        });




    };
    require(['amap']);


});