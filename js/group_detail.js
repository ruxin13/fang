require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1",
        'swiper': 'swiper.min'
    }
});
define(['common', 'jquery', 'swiper'], function (core, $, Swiper) {
    core.init();
    var modal = {
        s: ["", "栋", "间", "套", "人"],
        tuan: [
            {id:1,key:"tuanPrice1",name:"单人订床位"},
            {id:2,key:"tuanPrice2",name:"单人订整间"},
            {id:3,key:"tuanPrice3",name:"双人订整间"},
            {id:4,key:"tuanPrice4",name:"三人订整间"},
            {id:5,key:"tuanPrice5",name:"四人订整间"}
        ]
    };

    modal.env = "dev";


    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };
    modal.videoIndexArr = [];
    modal.id = core.parseQueryString().id;
    var swiper = new Swiper('.swiper-container-bed', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        init: false
    });
    modal.q = function (selector) {
        return document.querySelector(selector)
    };
    modal.judgeHeight = function (ele) {
        var originBriefHeight = ele.clientHeight;
        ele.style.height = "auto";
        ele.style.display = "block";
        var allBriefHeight = ele.clientHeight;
        if (originBriefHeight >= allBriefHeight) {
            ele.nextElementSibling.style.display = "none"
        } else {
            ele.removeAttribute("style")
        }
    };

    modal.init = function() {
        modal.initData();
        modal.eventBind();
    };

    modal.initData = function () {
        var pag = modal.q(".swiper-pagination");
        var swiper2 = new Swiper('.swiper-container-head', {
            pagination: {
                el: '.swiper-pagination',
                type: 'fraction',
            },
            on: {
                transitionEnd: function () {
                    var _this = this;
                    if (modal.videoIndexArr.length > 0) {
                        modal.videoIndexArr.forEach(function (item) {
                            if (item.index === _this.activeIndex) {
                                pag.classList.add("video")
                            } else {
                                pag.classList.remove("video")
                            }
                        })
                    } else {
                        pag.classList.remove("video")
                    }
                    var videos = document.querySelectorAll("video");
                    if (videos && videos.length > 0) {
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].pause();
                        }
                    }
                }
            }
        });

        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/tuan/tuan_details",
            method: "POST",
            dataType: "json",
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({"tuanId": modal.id}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var data = res.json;

                    var baseLiveNumber = modal.q("#baseLiveNumber");
                    var ownerHouseIsAuthentication = modal.q(".hc-ver");
                    var infoTitle = modal.q(".hc-tit");
                    var tags = modal.q(".hc-tags");

                    ownerHouseIsAuthentication.style.display = "flex";
                    ownerHouseIsAuthentication.innerText = "房源已认证";
                    ownerHouseIsAuthentication.classList.add("verified");
                    infoTitle.innerText = data.infoTitle;
                    if (data.tagName) {
                        var tagArr = data.tagName.split(",");
                        var tagStr = '';
                        tagArr.forEach(function (item) {
                            tagStr += '<div class="hc-tag">'+item+'</div>'
                        });
                        tags.innerHTML = tagStr;
                    }

                    var houseTypeArr = [null, "层", "卧", "浴", "厨", "卫", "客厅", "餐厅", "书房", "阳台"];
                    var bdArr = [
                        {
                            id: 1,
                            name: "大床",
                            icon: "icon_bed.png",
                            bed: [],
                            list: [null, "2*1.8m", "2*1.5m", "1.8*1.5m", "2*2m", "2*1.6m", "2.2*2.2m"]
                        },
                        {
                            id: 2,
                            name: "单人床",
                            icon: "icon_sbed.png",
                            bed: [],
                            list: [null, "2*1m", "2*1.2m", "1.9*2m", "2*0.8m", "2*1.35m", "2*1.1m", "2*1.3m"]
                        },
                        {
                            id: 3,
                            name: "双层床",
                            icon: "icon_dbed.png",
                            bed: [],
                            list: [null, "0.9*1.9m上，1.2*1.9m下", "1.2*1.9m上，1.5*1.9m下", "1.35*1.9m上，1.5*1.9m下", "0.9*1.8m", "1*1.9m", "1.2*1.9m", "1.8*1.2m"]
                        },
                        {id: 4, name: "沙发床", icon: "icon_sofa.png", bed: [], list: [null, "2*1.2m", "2*1.5m"]},
                        {id: 5, name: "圆床", icon: "icon_cbed.png", bed: [], list: [null, "直径2m", "直径2.2m"]}
                    ];
                    var htArr = data.baseHouseType.split(",");
                    if (htArr && htArr.length > 0) {
                        var htStr = '';
                        htArr.forEach(function (item, index) {
                            var itemArr = item.split("-");
                            if (itemArr[1] > 0) {
                                if (index === 0 && itemArr[2]) {
                                    htStr += itemArr[1] + "~" + itemArr[2] + houseTypeArr[parseInt(itemArr[0])];
                                } else {
                                    htStr += itemArr[1] + houseTypeArr[parseInt(itemArr[0])];
                                }
                                (index + 1) < htArr.length && (htStr += "/");
                            }
                            if (itemArr[0] === "2") {
                                modal.q("#roomCount").innerText = itemArr[1]
                            }
                            // if (itemArr[0] === "1") {
                            //     floor.innerText = itemArr[1]
                            // }
                            // if (index === 0 && itemArr[2]) {
                            //     floor.innerText = itemArr[1] + "~" + itemArr[2]
                            // }
                        });
                        modal.q("#baseHouseType").innerText = htStr;
                    }
                    if (data.baseBedType) {
                        var houseTypeSplit = data.baseBedType.split(",");
                        if (houseTypeSplit && houseTypeSplit.length > 0) {
                            houseTypeSplit.forEach(function (item) {
                                var htArr = item.split("-");
                                bdArr.forEach(function (item2) {
                                    if (parseInt(htArr[0]) === item2.id) {
                                        item2.bed.push(htArr);
                                    }
                                });
                            });
                        }
                    }
                    var hcInfo2 = modal.q("#hcInfo2");
                    bdArr.forEach(function (item) {
                        var hcHtml = '';
                        if (item.bed.length > 0) {
                            hcHtml += '<div class="hci-tli">\n';
                            hcHtml += '<img class="hci-icon" src="img/' + item.icon + '" alt />';
                            hcHtml += '<div class="hci-text">' + (item.bed[0][2] + "张" + item.name) + '</div></div>';
                            hcHtml += '<div class="hci-trli">';
                            item.bed.forEach(function (item2) {
                                hcHtml += '<div class="hci-trli-row"><span>(' + item.list[item2[1]] + ')</span>&times;' + item2[2] + '</div>'
                            });
                            hcHtml += '</div></div>\n';
                            var el = document.createElement("div");
                            el.classList.add("hci-tli-wrap");
                            el.classList.add("swiper-slide");
                            el.innerHTML = hcHtml;
                            hcInfo2.appendChild(el);
                            swiper.update();
                            swiper.init();
                        }
                    });
                    baseLiveNumber.innerText = data.baseLiveNumber;

                    var ruleOther = modal.q(".rule-other");
                    var rulePet = modal.q(".rule-pet");
                    var ruleParty = modal.q(".rule-party");

                    if (data.tuanBeginTime && data.tuanEndTime) {
                        modal.q("#tuanBeginTime").innerText = modal.parseTime(data.tuanBeginTime);
                        modal.q("#tuanEndTime").innerText = modal.parseTime(data.tuanEndTime);
                    }

                    if (data.ruleRequireJson) {
                        ruleOther.innerText = data.ruleRequireJson;
                        ruleOther.style.display = 'flex';
                    } else {
                        ruleOther.style.display = 'none';
                    }
                    rulePet.innerText = data.ruleIsAllowPet === 0 ? "不允许带宠物" : "允许带宠物";
                    ruleParty.innerText = data.ruleIsAllowParty === 0 ? "不允许举办活动或聚会" : "允许举办活动或聚会";

                    if (data.houseId) {
                        core.request({
                            url: modal.server[modal.env] + "/xiangdao-api/api/house/album_list/" + data.houseId,
                            method: "GET",
                            success: function (res) {
                                var list = res.json;
                                if (list && list.length > 0) {
                                    console.log(res);
                                    var str = '';
                                    list.forEach(function (item, index) {
                                        if (item.url) {
                                            var urls = item.url.split(",");
                                            if (urls.length > 0) {
                                                urls.forEach(function (item2, index2) {
                                                    str += '<div class="swiper-slide">';
                                                    if (item.type === 1 && index2 === 0) {
                                                        str += '<video id="video' + item.id + '" class="head-video-li" preload="auto" controls ' +
                                                            ' webkit-playsinline="true"\n' +
                                                            ' playsinline="true"\n' +
                                                            ' x5-playsinline="true"\n' +
                                                            ' x5-video-player-type="h5"\n' +
                                                            ' x5-video-player-fullscreen=""\n' +
                                                            ' x5-video-orientation="portraint"\n' +
                                                            ' x-webkit-airplay="true"\n' +
                                                            ' controlsList="nodownload"' +
                                                            ' controls="controls"' +
                                                            ' src="' + item2 + '" poster="' + item2 + '?vframe/jpg/offset/2/w/640/h/360" />';
                                                        modal.videoIndexArr.push({"index": index2, "item": item2});
                                                    } else {
                                                        str += '<img class="head-img-li" src="' + item2 + '" alt />';
                                                    }
                                                    str += '</div>';
                                                })
                                            }

                                        }
                                        if (index === 0 && item.type === 1) {
                                            pag.classList.add("video")
                                        }
                                    });
                                    modal.q("#headImgs").innerHTML = str;
                                    swiper2.update();

                                }
                            }
                        });
                    }


                    $.ajax({
                        url: modal.server[modal.env] + "/xiangdao-api/api/houseEditor/get_house_icon_group",
                        success: function (res2) {
                            console.log(res2);
                            var insData = res2.json;
                            if (insData && insData.length > 0) {
                                var html = '';
                                html += '<div class="ist">\n';
                                html += '<div class="ist-r">\n';
                                var profileHouseIcon = data.profileHouseIcon.split(",");
                                insData.forEach(function (item) {
                                    var istStr = '';
                                    item.list.forEach(function (item2) {
                                        var isSel = false;
                                        if (profileHouseIcon && profileHouseIcon.length > 0) {
                                            profileHouseIcon.forEach(function (item3) {
                                                var tmpArr = item3.split("-");
                                                if (tmpArr[0] == item.type && tmpArr[1] == item2.iconSeq) {
                                                    isSel = true;
                                                }
                                            });
                                        }
                                        if (isSel) {
                                            istStr += '<div class="ist-li ' + (isSel ? 'sel' : '') + '" data-id="' + item2.iconSeq + '">' + item2.iconName + '</div>';
                                        }
                                    });
                                    html += istStr;
                                });
                                html += '</div>';
                                html += '</div>';
                                var insWrapEle = modal.q("#insWrap");
                                insWrapEle.innerHTML = html;
                                modal.judgeHeight(insWrapEle);
                            }
                        }
                    });

                    if (data.faqCount) {
                        $(".ask-nodata").hide();
                        if (data.faqCount >= 2) {
                            $("#askShowAll").show();
                        }
                        var faqHtml = '<div class="ask-li">\n' +
                            '                <div class="ali-t">\n' +
                            '                    <img class="ali-avatar" src="' + data.lastFaqAvatar + '" alt />\n' +
                            '                    <div class="ali-name">' + data.lastFaqNickName + '</div>\n' +
                            '                </div>\n' +
                            '                <div class="ali-tit">' + data.lastFaqTitle + '</div>\n' +
                            '            </div>';
                        $("#askList").html(faqHtml);
                    }

                    modal.q("#joinPersonNumber").innerText = data.joinPersonNumber || 0;
                    modal.q("#phone").setAttribute("href", "tel:" + data.rulePhone);
                    if (data.tuanNotice) {
                        modal.q("#tuanNotice").innerHTML = data.tuanNotice;
                    }
                    if (data.surplusTimestamp && data.surplusTimestamp > 0) {
                        modal.surplusTimestamp = data.surplusTimestamp;
                        restTime.innerHTML = modal.formatTime(data.surplusTimestamp);
                        var int = setInterval(function () {
                            var newTime = modal.surplusTimestamp - 1;
                            var restTime = modal.formatTime(newTime > 0 ? newTime : 0);
                            modal.q("#restDays").innerText = restTime.day;
                            modal.q("#restTime").innerHTML = restTime.time;
                            modal.surplusTimestamp = newTime;
                            if (newTime <= 0) {
                                clearInterval(int);
                            }
                        }, 1000);
                    }
                    if (data.reserveTypeStr) {
                        var typeStr = '';
                        var types = data.reserveTypeStr.split(",");
                        modal.tuan.forEach(function (item) {
                            types.forEach(function (item2) {
                                if (item.id === parseInt(item2)) {
                                    typeStr += '<div class="st-li st-se">\n' +
                                        '            <div class="st-l">\n' +
                                        '                 <div class="st-t">'+item.name+'</div>\n' +
                                        '                 <div class="st-b">拼团价: <i>￥</i><span class="st-price" id="'+item.key+'">'+data[item.key]+'</span><span class="st-inf">人/日/床位/包吃住</span></div>\n' +
                                        '            </div>\n' +
                                        '            <div class="st-r link">订</div>\n' +
                                        '       </div>'
                                }
                            });
                        });
                        modal.q(".st-list").innerHTML = typeStr;
                    }
                }
            }
        });
    };

    modal.eventBind = function() {
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
    };




    modal.formatTime = function(time) {
        var day = parseInt(time / 86400);
        var hour = parseInt(time % 86400 / 3600);
        var minute = parseInt(time % 3600 / 60);
        var second = parseInt(time % 60);
        if (hour < 10) {hour = "0" + hour}
        if (minute < 10) {minute = "0" + minute}
        if (second < 10) {second = "0" + second}
        return {
            day: day,
            time: '<span>'+hour+'</span>:' + '<span>'+minute+'</span>:' + '<span>'+second+'</span>'
        };
    };

    modal.parseTime = function(timestamp) {
        if (timestamp) {
            var date = new Date(timestamp);
            var m = date.getMonth() + 1;
            var d = date.getDate();
            return m + "月" + d + "日"
        } else {
            return ""
        }
    };


    modal.init();
});