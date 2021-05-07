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
        s: ["", "栋", "间", "套", "人"]
    };


    modal.env = "dev";


    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };
    modal.videoIndexArr = [];
    modal.id = core.parseQueryString().houseId;
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


    core.request({
        url: modal.server[modal.env] + "/xiangdao-api/api/house/album_list/" + modal.id,
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


    core.request({
        url: modal.server[modal.env] + "/xiangdao-api/api/house/details/" + modal.id,
        method: "GET",
        success: function (res2) {
            console.log(res2);
            var data = res2.json;
            // var infoCover = modal.q(".header-img");
            var ownerHouseIsAuthentication = modal.q(".hc-ver");
            var ownerAvatar = modal.q(".hc-user");
            var houseNo = modal.q("#houseNo");
            var profileStr = modal.q("#profileStr");
            var infoTitle = modal.q(".hc-tit");
            var baseIndoorArea = modal.q("#baseIndoorArea");
            var baseOrientation = modal.q("#baseOrientation");
            var baseEstablishDate = modal.q("#baseEstablishDate");
            var profileRentMode = modal.q("#profileRentMode");
            var profileRentMode2= modal.q("#profileRentMode2");
            var baseCourtyardArea = modal.q("#baseCourtyardArea");
            var ownerAvatar2 = modal.q("#ownerAvatar2");
            var ownerNickName = modal.q("#ownerNickName");
            var ownerHouseIsAuthentication2 = modal.q("#ownerHouseIsAuthentication2");
            var baseOwnerBrief = modal.q("#baseOwnerBrief");
            // var lastFaqAvatar = modal.q("#lastFaqAvatar");
            // var lastFaqNickName = modal.q("#lastFaqNickName");
            // var lastFaqTitle = modal.q("#lastFaqTitle");
            var ruleYearMoney = modal.q("#ruleYearMoney");
            var baseLiveNumber = modal.q("#baseLiveNumber");
            var floor = modal.q("#floor");
            var infoBrief = modal.q("#infoBrief");
            // var ruleMonthMoney = modal.q("#ruleMonthMoney");
            // var ruleNewYearMoney = modal.q("#ruleNewYearMoney");
            // var phone = modal.q("#phone");
            var otherDesc = modal.q("#otherDesc");
            var mpConfirm = modal.q("#mpConfirm");
            var nearby = modal.q(".nearby");

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
            var baseNoiseArr = [null, "靠近小区内主路", "靠近主路", "靠近停车场", "靠近公园或广场", "靠近夜市", "周边较安静", "周边很安静", "靠近飞机场", "靠近小区出入口"];
            var baseSceneryArr = [null, "小区内部", "可见花园", "可见山景", "可见湖景", "可见江景", "可见海景", "可见树林", "可见街景", "可见游泳池", "可见高尔夫球场"];
            // console.log(data);
            // data.baseBedType = "1-1-2,3-1-5,3-2-3";
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
            if (data.baseIndoorScenery) {
                var bisStr = '';
                data.baseIndoorScenery.split(",").forEach(function (item) {
                    bisStr += '<div class="hci-label">' + baseSceneryArr[parseInt(item)] + '</div>'
                });
                $("#baseScenery").html(bisStr)
            } else {
                $("#baseIndoorScenery").hide();
            }

            if (data.baseNoise) {
                var bnStr = '';
                data.baseNoise.split(",").forEach(function (item) {
                    bnStr += '<div class="hci-label">' + baseNoiseArr[parseInt(item)] + '</div>'
                });
                $("#baseNoise").html(bnStr)
            } else {
                $("#baseNoiseWrap").hide();
            }
            nearby.addEventListener("click", function () {
                location.href = "video.html?id=" + data.villageId
            }, false);

            $.ajax({
                url: modal.server[modal.env] + "/xiangdao-api/api/house/house_list",
                method: "POST",
                dataType: "json",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    "villageId": data.villageId
                }),
                success: function (res3) {
                    console.log(res3);
                    if (res3.status === 0) {
                        var houseData = res3.json.result;
                        if (houseData && houseData.length > 0) {
                            var houseHtml = '';
                            houseData.forEach(function (item) {
                                houseHtml += '<div class="hli" data-id="'+item.houseId+'">\n' +
                                    '                <img class="hli-img" src="' + item.infoCover + '" alt />\n' +
                                    // '                <img class="hli-avatar" src="'+item.ownerAvatar+'" alt />\n' +
                                    '                <div class="hli-stit">' + item.profileStr + '</div>\n' +
                                    '                <div class="hli-tit">' + item.infoTitle + '</div>\n' +
                                    '                <div class="hli-price">￥<span>' + item.ruleMonthMoney + '</span>'+(item.profileRentMode ? ('/'+modal.s[item.profileRentMode]):'')+'/月</div>\n' +
                                    '            </div>';
                            });
                            modal.q("#hlist").innerHTML = houseHtml;
                            $(".hli").on("click", function () {
                                var id = $(this).data("id");
                                location.href = "house_details.html?houseId=" + id
                            });
                        }
                        var linkApp = document.querySelectorAll(".link");
                        if (linkApp && linkApp.length > 0) {
                            for (var z = 0; z < linkApp.length; z++) {
                                linkApp[z].addEventListener("click", function () {
                                    openApp();
                                }, false);
                            }
                        }
                    }

                }
            });

            var hcInfo2 = modal.q("#hcInfo2");
            bdArr.forEach(function (item) {
                var hcHtml = '';
                if (item.bed.length > 0) {
                    var bedNum = 0;
                    item.bed.forEach(function (item3) {
                        bedNum += parseInt(item3[2]);
                    });
                    hcHtml += '<div class="hci-tli">\n';
                    hcHtml += '<img class="hci-icon" src="img/' + item.icon + '" alt />';
                    hcHtml += '<div class="hci-text">' + (bedNum + "张" + item.name) + '</div></div>';
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

            var htArr = data.baseHouseType.split(",");
            if (htArr && htArr.length > 0) {
                var htStr = '';
                htArr.forEach(function (item, index) {
                    var itemArr = item.split("-");
                    if (itemArr[1] > 0) {
                        htStr += itemArr[1] + houseTypeArr[parseInt(itemArr[0])];
                        (index + 1) < htArr.length && (htStr += "/");
                    }
                    if (itemArr[0] === "2") {
                        modal.q("#roomCount").innerText = itemArr[1]
                    }
                    if (itemArr[0] === "1") {
                        floor.innerText = itemArr[1]
                    }
                    if (index === 0 && itemArr[2]) {
                        floor.innerText = itemArr[1] + "~" + itemArr[2]
                    }
                });
                modal.q("#baseHouseType").innerText = htStr;
            }

            ownerHouseIsAuthentication.style.display = "flex";
            ownerHouseIsAuthentication.innerText = "房源已认证";
            ownerHouseIsAuthentication.classList.add("verified");

            ownerAvatar.src = data.ownerAvatar;
            houseNo.innerText = data.houseNo;
            profileStr.innerText = data.profileStr;
            infoTitle.innerText = data.infoTitle;
            baseIndoorArea.innerText = data.baseIndoorArea;
            baseOrientation.innerText = data.baseOrientation;
            baseEstablishDate.innerText = new Date(data.baseEstablishDate).getFullYear();
            profileRentMode.innerText = [null, "整栋出租", "独立出租", "整套出租"][data.profileRentMode];
            profileRentMode2.innerText = data.profileRentMode ? ('/' + modal.s[data.profileRentMode]) : '';
            // ownerAvatar2.src = data.ownerAvatar;
            // lastFaqAvatar.src = data.lastFaqAvatar;
            // ownerNickName.innerText = data.ownerNickName;
            // if (data.baseOwnerBrief) {
            //     baseOwnerBrief.innerText = data.baseOwnerBrief;
            //     modal.judgeHeight(baseOwnerBrief)
            // } else {
            //     baseOwnerBrief.style.display = "none";
            //     baseOwnerBrief.nextElementSibling.style.display = "none";
            //     modal.q(".pan-user").style.marginBottom = "0px"
            // }

            // lastFaqNickName.innerText = data.lastFaqNickName;
            // lastFaqTitle.innerText = data.lastFaqTitle;
            ruleYearMoney.innerText = data.ruleMonthMoney;
            infoBrief.innerText = data.infoBrief;
            modal.judgeHeight(infoBrief);
            baseLiveNumber.innerText = data.baseLiveNumber;
            if (data.ruleOtherMoneyDesc && data.ruleOtherMoneyDesc !== "undefined") {
                otherDesc.innerText = data.ruleOtherMoneyDesc;
            }
            phone.setAttribute("href", "tel:" + data.rulePhone);

            mpConfirm.addEventListener("click", function () {
                this.parentNode.parentNode.style.display = "none"
            }, false);

            // if (data.ownerHouseIsAuthentication2 == 1) {
            //     ownerHouseIsAuthentication2.innerText = "已实名认证"
            // } else {
            //     ownerHouseIsAuthentication2.innerText = "未实名认证"
            // }
            var ruleOther = modal.q(".rule-other");
            var rulePet = modal.q(".rule-pet");
            var ruleParty = modal.q(".rule-party");
            if (data.ruleRequireJson) {
                ruleOther.innerText = data.ruleRequireJson;
                ruleOther.style.display = 'flex';
            } else {
                ruleOther.style.display = 'none';
            }
            rulePet.innerText = data.ruleIsAllowPet === 0 ? "不允许带宠物" : "允许带宠物";
            ruleParty.innerText = data.ruleIsAllowParty === 0 ? "不允许举办活动或聚会" : "允许举办活动或聚会";
            $.ajax({
                url: modal.server[modal.env] + "/xiangdao-api/api/house/faq_list",
                method: "POST",
                dataType: "json",
                async: false,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({"houseId": modal.id, "pageNo": 1, "pageSize": 6}),
                success: function (res6) {
                    console.log(res6);
                    var list = res6.json.result;
                    if (res6.json.totalCount > 2) {
                        list.length > 2 && (list.length = 2);
                        $("#askShowAll").show();
                    }
                    var askHtml = '';
                    if (list && list.length > 0) {
                        modal.q(".ask-nodata").style.display = "none";
                        list.forEach(function (item) {
                            var replyHtml = '';
                            if (item.replyCount > 0) {

                            replyHtml += '<div class="ali-reply">\n' +
                                '                    <div class="ali-rep-t">\n' +
                                '                        <img class="ali-rep-avatar" src="' + item.lastReplyAvatar + '" alt />\n' +
                                '                        <div class="ali-rep-name">' + item.lastReplyNickName + '</div>\n' +
                                '                    </div>\n' +
                                '                    <div class="ali-rep-tit">' + item.lastReplyTitle + '</div>\n' +
                                '                </div>\n';
                                if (item.replyCount > 1) {
                                    var avatars = item.avatarUrl.split(",");
                                    var avatarHtml = '';
                                    if (avatars && avatars.length > 0) {
                                        avatars.shift();
                                        if (avatars.length > 4) {
                                            avatars.length = 4
                                        }
                                        avatars.forEach(function (item2) {
                                            avatarHtml += '<img class="alp-avatar" src="'+item2+'" alt />'
                                        })
                                    }
                                    replyHtml += '<div class="ali-rep-more">\n' +
                                        '                    <div class="alp-avatars">\n' +
                                        avatarHtml +
                                        '                    </div>\n' +
                                        '                    <div class="alp-txt">'+item.lastReplyNickName+'等'+(item.replyCount - 1)+'人也进行了回答</div>\n' +
                                        '                </div>'
                                }




                            }

                            askHtml += '<div class="ask-li" data-id="' + item.faqId + '">\n' +
                                '                <div class="ali-t">\n' +
                                '                    <img class="ali-avatar" src="' + item.avatar + '" alt />\n' +
                                '                    <div class="ali-name">' + item.nickName + '</div>\n' +
                                '                </div>\n' +
                                '                <div class="ali-tit">' + item.title + '</div>\n' +
                                replyHtml +
                                '            </div>'

                            // askHtml += '<div class="pans-user">\n' +
                            //     '                <img class="pus-l" src="'+item.avatar+'" alt />\n' +
                            //     '                <div class="pus-c">\n' +
                            //     '                    <div class="pus-name">'+item.nickName+'</div>\n' +
                            //     '                </div>\n' +
                            //     '            </div>'+
                            //     '      <div class="pus-stit">'+item.title+'</div>\n';
                        });
                        $("#askList").html(askHtml)
                    }
                }
            });


            if (data.baseCourtyardArea > 0) {
                baseCourtyardArea.innerText = data.baseCourtyardArea;
                baseCourtyardArea.parentNode.parentNode.style.display = "flex";
            } else {
                baseCourtyardArea.parentNode.parentNode.style.display = "none";
            }
            // modal.q("#togglePrice").addEventListener('click', function () {
            //     var mul = modal.q(".multi-price");
            //     var isHid = mul.style.display;
            //     if (isHid === "none") {
            //         mul.style.display = "block"
            //     } else {
            //         mul.style.display = "none"
            //     }
            // }, false);



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

        }
    });


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
});