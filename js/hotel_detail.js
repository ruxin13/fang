require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1",
        'swiper': 'swiper.min'
    },
});
define(['common', 'jquery', 'swiper'], function (core, $, Swiper) {
    core.init();
    var modal = {
        server: {
            "dev": "//dev.xiangdao.info",
            "pro": "//www.xiangdao.info"
        },
        rType: {
            10: { name: "单人订床位" },
            11: { name: "单人订整间" },
            12: { name: "双人订整间" },
            13: { name: "三人订整间" },
            14: { name: "四人订整间" },
            20: { name: "订整间" },
            30: { name: "订整套" },
            40: { name: "订整栋" }
        },
        fType: {
            1: "包三餐",
            2: "可做饭",
            3: "不包吃不可做饭"
        }
    };
    modal.env = "dev";
    modal.videoIndexArr = [];
    modal.id = core.parseQueryString().id;
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
    modal.parseDateForComment = function(timestamp) {
        var date = new Date(timestamp);
        return ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()) + " " +
            (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours()) + ":" +
            (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes())
    };
    var swiper3, swiper4;

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

        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/hotel_details/" + modal.id,
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify({"roomId": modal.id}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var data = res.json;
                    let playVideo = q("#playVideo");
                    let videoFullScreen = q("#videoFullScreen");

                    playVideo.src = data.video;
                    playVideo.poster = data.cover;
                    playVideo.oncanplay = function () {
                        playVideo.play();
                    }
                    videoFullScreen.addEventListener("click", function (){
                        if (playVideo.requestFullscreen) {
                            playVideo.requestFullscreen();
                        } else if (playVideo.webkitRequestFullScreen) {
                            playVideo.webkitRequestFullScreen();
                        }
                    }, false);
                    var hotelTitle = q(".hc-tit");
                    var hotelName = q(".hc-inf");
                    var content = q("#content");
                    var validDate = q("#validDate");
                    var bookingNotice = q("#bookingNotice");
                    var housePolicy = q("#housePolicy");
                    var tagWrap = q(".top-tags-l");
                    var tagWrapPop = q(".pe-list");
                    var areaAddress = q("#areaAddress");
                    var priceRemark = q("#priceRemark");
                    hotelTitle.innerText = data.hotelTitle;
                    hotelName.innerText = data.hotelName;
                    if (data.housePolicy && housePolicy) {
                        housePolicy.innerHTML = data.housePolicy;
                    } else {
                        q("#housePolicyEl").style.display = "none"
                    }
                    if (data.content && content) {
                        content.innerHTML = data.content;
                        q("#allContent").innerHTML = data.content;
                        q(".ct-back").addEventListener("click", function () {
                            q(".ct").style.display = "none";
                            unLockBg();
                        }, false);
                    } else {
                        q("#contentEl").style.display = "none"
                    }
                    if (data.bookingNotice && bookingNotice) {
                        content.innerHTML = data.bookingNotice;
                    } else {
                        q("#bookingNoticeEl").style.display = "none"
                    }
                    bookingNotice.innerHTML = data.bookingNotice;

                    if (data.hotelTagName) {
                        var tagArr = data.hotelTagName.split(",");
                        var tagStr = '';
                        var allTagStr = '';
                        tagArr.forEach(function (item, index) {
                            if (index < 4) {
                                tagStr += '<div class="top-tag">'+item+'</div>';
                            } else {
                                q(".top-tags-r").style.display = 'block'
                            }
                            allTagStr += '<div class="top-tag-pop">'+item+'</div>';
                        });
                        tagWrap.innerHTML = tagStr;
                        tagWrapPop.innerHTML = allTagStr;
                    }
                    if (areaAddress) {
                        areaAddress.innerText = data.locationProvinceName + data.locationCityName + data.locationTownName;
                    }
                    if (data.validBeginTime && data.validEndTime && validDate) {
                        var begin = modal.parseTime(data.validBeginTime);
                        var end = modal.parseTime(data.validEndTime);
                        validDate.it(begin + "-" + end);
                    }
                    if (priceRemark) {
                        priceRemark.innerHTML = data.priceRemark;
                    }

                    modal.getRoomsList(null, null, "1", modal.id, function (roomStr) {
                        if (roomStr) {
                            q("#hasFood").innerHTML = roomStr;
                        } else {
                            q("#hasFoodWrap").style.display = 'none';
                        }
                        modal.getRoomsList(null, null, "1,2,3", modal.id, function (roomStr) {
                            if (roomStr) {
                                q("#noFood").innerHTML = roomStr;
                            } else {
                                q("#noFoodWrap").style.display = 'none';
                            }
                            // modal.eventBind();
                            modal.openRoom();
                            modal.closeRoom();
                        });
                    });



                    if (data.hotelIcon && data.hotelIconList && data.hotelIconList.length > 0) {
                        let insStr = '';
                        let iconArr = data.hotelIcon.split(",");
                        data.hotelIconList.forEach(item => {
                            insStr += `<div class="pt-group">
                                                    <div class="pt-tit"><img class="pt-yqss" src="${item.typeUrl}" alt />${item.typeName}</div>
                                                    <div class="pt-con">`;
                            iconArr.forEach(item2 => {
                                let _iconArr = item2.split('-');
                                if (~~_iconArr[0] === ~~item.type) {
                                    let _list = item.list;
                                    if (_list && _list.length > 0) {
                                        _list.forEach(item3 => {
                                            if (~~_iconArr[1] === ~~item3.iconSeq) {
                                                insStr += `<div class="pt-li">
                                                                <img class="pt-img" src="${item3.iconUrl}" alt/>
                                                                <div class="pt-name">${item3.iconName}</div>
                                                            </div>`;
                                            }
                                        });
                                    }
                                }
                            });

                            insStr += `</div></div>`;
                        });
                        q("#insWrap").innerHTML = insStr;
                    }

                    if (data.faqList && data.faqList.length > 0) {
                        let faqStr = '';
                        data.faqList.forEach(item => {
                            faqStr += `<div class="pan-question">
                                            <div class="pq-ask">${item.issue}</div>
                                            <div class="pq-ans"><span>${item.reply}</span>
                                            </div>
                                        </div>`;
                        });
                        q("#faqWrap").innerHTML = faqStr;
                    } else {
                        q("#faqEl").style.display = "none";
                    }

                    if (data.aqList && data.aqList.length > 0 && data.aqCount > 0) {
                        let aqStr = '';
                        data.aqList.forEach(item => {
                            aqStr += `<div class="ask-li">
                                        <div class="ask-l">问</div>
                                        <div class="ask-c">${item.title}</div>
                                        <div class="ask-r">${item.replyCount}个回答</div>
                                    </div>`;
                        });
                        aqStr += '<div class="ask-btn">查看全部</div>';
                        q("#askList").innerHTML = aqStr;
                        q(".ask-nodata").style.display = 'none';
                    }

                    if (!data.commentCount) {
                        var html = '';
                        html += '<div class="comment-nodata">' +
                            '<img class="comment-nodata-icon" src="img/comment_nodata.png" alt />' +
                            '<div class="comment-nodata-tit">暂无评论</div>' +
                            '<div class="comment-nodata-stit">还没有房客对该房源发出评论</div></div>';
                        q("#commentList").innerHTML = html;
                    } else {
                        // 评论列表
                        modal.commentList = data.commentList;
                        data.commentList.forEach(function (item) {
                            item.totalList = item.list;
                        });
                        modal.renderCommentList();
                    }

                    modal.locationProvinceName = data.locationProvinceName;
                    modal.locationCityName = data.locationCityName;
                    modal.locationTownName = data.locationTownName;


                    modal.getNear(~~data.locationDistrict > 0 ? data.locationDistrict : data.locationTown);

                    let allHouse = q("#allHouse");
                    allHouse && allHouse.addEventListener("click", function () {
                        q(".ct").style.display = "flex";
                        lockBg();
                    }, false);

                }
            }
        });
        modal.bindTag1();

        modal.onAMapLoaded();
    };

    modal.openRoom = function (){
        let details = document.querySelectorAll(".nli-inr");
        if (details && details.length > 0) {
            details.forEach(function (item) {
                item.addEventListener("click", function (e) {
                    q(".dp-wrap").style.display = "block";
                    lockBg();
                    modal.getBed(e.target.dataset.id, function () {});

                }, false);
            })
        }
    };

    modal.closeRoom = function () {
        let houseClose = q("#houseClose");
        if (houseClose) {
            houseClose.addEventListener("click", function () {
                let wrap = q(".dp-wrap");
                if (wrap) {
                    wrap.classList.remove("slideUp");
                    wrap.classList.add("slideDown");
                    swiper3.removeAllSlides();
                    swiper3.detachEvents();
                    swiper3 = null;
                    swiper4.detachEvents();
                    wrap.addEventListener("webkitAnimationEnd", function (e) {
                        if (e.animationName === "slideOut") {
                            wrap.style.display = "none";
                            wrap.classList.remove("slideDown");
                            wrap.classList.add("slideUp");
                            unLockBg();
                        }
                    });
                }
            }, false);
        }
    };

    modal.bindTag1 = function (){
        let moreTags = q(".hc-tags");
        let closeMoreTags = q(".pe-close");
        if (moreTags) {
            moreTags.addEventListener("click", function (){
                q(".pe") && (q(".pe").style.display = "flex");
                lockBg();
            }, false);
        }
        if (closeMoreTags) {
            closeMoreTags.addEventListener("click", function (){
                q(".pe") && (q(".pe").style.display = "none");
                unLockBg();
            }, false);
        }
    };

    modal.bindTag2 = function (){
        let moreRoomTags = q(".dmt-tags");
        let closeMoreRoomTags = q(".pe2-close");
        if (moreRoomTags) {
            moreRoomTags.addEventListener("click", function (){
                q(".pe2") && (q(".pe2").style.display = "flex");
                lockBg();
            }, false);
        }

        if (closeMoreRoomTags) {
            closeMoreRoomTags.addEventListener("click", function (){
                q(".pe2") && (q(".pe2").style.display = "none");
                unLockBg();
            }, false);
        }
    };

    modal.getBed = function (id, cb) {
        let pag = q(".swiper-pagination-pop")

        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/hotel_room_details/" + id,
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify({"roomId": id}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    let data = res.json;
                    if (data.albumList && data.albumList.length > 0) {
                        var list = data.albumList;
                        if (list && list.length > 0) {
                            var str = '';
                            list.forEach(function (item, index) {
                                if (item.url) {
                                    var urls = item.url.split(",");
                                    if (urls.length > 0) {
                                        urls.forEach(function (item2, index2) {
                                            if (item.type === 2) {
                                            str += '<div class="swiper-slide">';
                                            // if (item.type === 1 && index2 === 0) {
                                            //     str += '<video id="video' + item.id + '" class="head-video-li" preload="auto" controls ' +
                                            //         ' webkit-playsinline="true"\n' +
                                            //         ' playsinline="true"\n' +
                                            //         ' x5-playsinline="true"\n' +
                                            //         ' x5-video-player-type="h5"\n' +
                                            //         ' x5-video-player-fullscreen=""\n' +
                                            //         ' x5-video-orientation="portraint"\n' +
                                            //         ' x-webkit-airplay="true"\n' +
                                            //         ' controlsList="nodownload"' +
                                            //         ' preload="auto"' +
                                            //         ' controls="controls"' +
                                            //         ' src="' + item2 + '" poster="' + item2 + '?vframe/jpg/offset/2/w/640/h/360" />';
                                            //     modal.videoIndexArr.push({"index": index2, "item": item2});
                                            // } else {
                                                str += '<img class="head-img-li" src="' + item2 + '" alt />';
                                            // }
                                            str += '</div>';
                                            }
                                        })
                                    }

                                }
                                if (index === 0 && item.type === 1) {
                                    pag.classList.add("video")
                                }
                            });
                            q("#headImgs").innerHTML = str;
                            swiper3 = new Swiper('.swiper-container-head', {
                                pagination: {
                                    el: '.swiper-pagination-pop',
                                    type: 'fraction'
                                },
                                lazy: true,
                                autoplay: {
                                    delay: 3000,
                                    disableOnInteraction: false,
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

                        }
                    }

                    let roomTitle = q("#roomTitle");
                    let roomTitle2 = q("#roomTitle2");

                    if (roomTitle) { roomTitle.innerText = data.roomTitle }
                    if (roomTitle2) { roomTitle2.innerText = data.roomTitle }
                    if (data.roomTagName) {
                        let tagWrapPop = q(".pe2-list");
                        let tagStr = '';
                        let allTagStr = '';
                        let tagArr = data.roomTagName.split(",");
                        tagArr.forEach((item, index) => {
                            if (index < 4) {
                                tagStr += `<div class="dmt-tag">${item}</div>`;
                            }
                            allTagStr += '<div class="top-tag-pop">'+item+'</div>';
                        });
                        if (tagArr.length > 3) {
                            tagStr += `<img class="dmt-tag-more" src="img/icon_arrow_rs.png" alt />`;
                        }
                        q("#roomTags").innerHTML = tagStr;
                        tagWrapPop.innerHTML = allTagStr;
                    } else {
                        q("#roomTags").style.display = "none";
                    }
                    modal.bindTag2()

                    let houseTypeArr = [null, "室", "厨", "卫", "厅", "厅", "书房", "阳台"];
                    if (data.houseType) {
                        let retStr = '';
                        let houseTypeSplit = data.houseType.split(",");
                        let retArr = [];
                        houseTypeSplit.forEach(item => {
                            let _split = item.split("-");
                            let _obj = {};
                            _obj.id = ~~_split[0];
                            _obj.num = ~~_split[1];
                            if (_obj.id === 1) {
                                modal.roomCount = _obj.num;
                            }
                            retArr.push(_obj);
                        });
                        retArr[3].num += retArr[4].num;
                        retArr.forEach((item, index) => {
                            if (index !== 4 && item.num > 0) {
                                retStr += `/${item.num}${houseTypeArr[item.id]}`
                            }
                        });
                        retStr = retStr.replace("/", '');
                        q("#houseType").innerText = retStr;
                    }

                    let roomArea = q("#roomArea");
                    if (data.roomArea && roomArea) {
                        roomArea.innerText = data.roomArea;
                    }

                    if (data.bedType) {
                        let bdArr = [
                            {
                                id: 1,
                                name: "大床",
                                icon: "icon_bed.png",
                                bed: [],
                                list: [null, "2*1.8m", "2*1.5m", "1.8*1.5m", "2*2m", "2*1.6m", "2.2*2.2m"]
                            }, {
                                id: 2,
                                name: "单人床",
                                icon: "icon_sbed.png",
                                bed: [],
                                list: [null, "2*1m", "2*1.2m", "1.9*2m", "2*0.8m", "2*1.35m", "2*1.1m", "2*1.3m"]
                            }, {
                                id: 3,
                                name: "双层床",
                                icon: "icon_dbed.png",
                                bed: [],
                                list: [null, "0.9*1.9m上，1.2*1.9m下", "1.2*1.9m上，1.5*1.9m下", "1.35*1.9m上，1.5*1.9m下", "0.9*1.8m", "1*1.9m", "1.2*1.9m", "1.8*1.2m"]
                            },
                            {id: 4, name: "沙发床", icon: "icon_sofa.png", bed: [], list: [null, "2*1.2m", "2*1.5m"]},
                            {id: 5, name: "圆床", icon: "icon_cbed.png", bed: [], list: [null, "直径2m", "直径2.2m"]}
                        ];
                        swiper4 = new Swiper('.swiper-container-bed', {
                            slidesPerView: 'auto',
                            spaceBetween: 30,
                            lazy: true,
                            init: false
                        });
                        let bedTypeSplit = data.bedType.split(",");
                        if (bedTypeSplit && bedTypeSplit.length > 0) {
                            bedTypeSplit.forEach(function (item) {
                                var htArr = item.split("-");
                                bdArr.forEach(function (item2) {
                                    if (parseInt(htArr[0]) === item2.id) {
                                        item2.bed.push(htArr);
                                    }
                                });
                            });
                        }
                        var hcInfo2 = q("#hcInfo2");
                        bdArr.forEach(function (item) {
                            let baseHtml = `<div class="hci-tli-wrap swiper-slide">
                                                <div class="hci-tli">
                                                    <img class="hci-icon" src="img/icon_guest.png" alt />
                                                    <div class="hci-text"><span id="liveNumber">${data.liveNumber}</span>个房客</div>
                                                </div>
                                            </div>
                                            <div class="hci-tli-wrap swiper-slide">
                                                <div class="hci-tli">
                                                    <img class="hci-icon" src="img/icon_room.png" alt />
                                                    <div class="hci-text"><span id="roomCount">${modal.roomCount}</span>间卧室</div>
                                                </div>
                                            </div>`;
                            var hcHtml = ``;
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
                                hcInfo2.innerHTML = baseHtml;
                                hcInfo2.appendChild(el);
                            }
                        });
                        swiper4.update();
                        swiper4.init();
                    }

                    let roomBrief = q("#roomBrief");
                    let roomBriefEl = q("#roomBriefEl");
                    if (data.roomBrief && roomBriefEl) {
                        roomBrief.innerHTML = data.roomBrief;
                    } else {
                        roomBriefEl.style.display = 'none'
                    }

                    if (data.houseIcon && data.houseIconList && data.houseIconList.length > 0) {
                        let insStr = '';
                        let iconArr = data.houseIcon.split(",");
                        data.houseIconList.forEach(item => {
                            insStr += `<div class="pt-group">
                                                    <div class="pt-tit"><img class="pt-yqss" src="${item.typeUrl}" alt />${item.typeName}</div>
                                                    <div class="pt-con">`;
                            iconArr.forEach(item2 => {
                                let _iconArr = item2.split('-');
                                if (~~_iconArr[0] === ~~item.type) {
                                    let _list = item.list;
                                    if (_list && _list.length > 0) {
                                        _list.forEach(item3 => {
                                            if (~~_iconArr[1] === ~~item3.iconSeq) {
                                                insStr += `<div class="pt-li">
                                                                <img class="pt-img" src="${item3.iconUrl}" alt/>
                                                                <div class="pt-name">${item3.iconName}</div>
                                                            </div>`;
                                            }
                                        });
                                    }
                                }
                            });

                            insStr += `</div></div>`;
                        });
                        q("#houseIconWrap").innerHTML = insStr;
                    }

                    typeof cb === "function" && cb();
                }
            }
        });
    };

    modal.getNear = function (searchLocation) {
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/search_list",
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify({"searchLocation": searchLocation, "pageNo": 1}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    let list = res.json.result;
                    modal.nearList = list;
                    if (list && list.length > 0) {
                        let str = '';
                        list.forEach(item => {
                            if (item.type === 2) {
                                let tagStr = '';
                                let tagList = [];
                                if (item.tagName) {
                                    let tagArr = item.tagName.split(",");
                                    tagArr.forEach((item2, index2) => {
                                        tagList.push(item2);
                                        if (index2 < 4) {
                                            tagStr += `<div class="sai-tro sai-tro-all" data-id="${item.id}">${item2}</div>`;
                                        }
                                    });
                                    if (tagArr && tagArr.length > 4) {
                                        tagStr += `<img class="sai-tro-more sai-tro-all" data-id="${item.id}" src="img/icon_arrow_rs.png" alt />`;
                                    }
                                    item.tagList = tagList;
                                }
                                str += `<div class="sa-li">
                                        <div class="sai-t">
                                            <div class="sai-tl">
                                                <img class="sai-tl-img" src="${item.cover}" alt />
                                                <div class="sai-tl-pos">${item.locationProvinceName.replace(/省/, '')} · ${item.locationCityName.replace(/[市县区]/g, '')}</div>
                                            </div>
                                            <div class="sai-tr">${tagStr}</div>
                                        </div>
                                        <div class="sai-st">${item.name}</div>
                                        <div class="sai-tit">${item.title}</div>
                                        <div class="sai-inf"><span><i>￥</i>${item.monthReferPrice ? item.monthReferPrice : (item.dayReferPrice ? item.dayReferPrice * 30 : 0)}</span>起/${(item.reserveType === "10" ? "人/" : "") + modal.rType[item.reserveType].name.slice(-2)}/30晚</div>
                                        <div class="sai-row">
                                            <div class="sai-tags">
                                            ${item.foodType ? ('<div class="sai-tag-l">' + modal.fType[item.foodType] + '</div>') : ''}
                                            <div class="sai-tag-r ${item.foodType ? '' : 'sai-tag-single'}">30晚起租</div>
                                            </div>
                                            <div class="sai-detail">详情</div>
                                        </div>
                                    </div>`;
                            }

                        });
                        q("#saList").innerHTML = str;

                        let tags = document.querySelectorAll(".sai-tro-all");
                        if (tags && tags.length > 0) {
                            tags.forEach(item => {
                                item.addEventListener("click", function (e) {
                                    let id = e.target.dataset.id;
                                    let list = modal.nearList;
                                    if (list && list.length > 0) {
                                        list.forEach(item2 => {
                                            if (~~id === ~~item2.id) {
                                                let _list = item2.tagList;
                                                let _str = '';
                                                if (_list && _list.length > 0) {
                                                    _list.forEach(item3 => {
                                                        _str += `<div class="top-tag-pop">${item3}</div>`;
                                                    });
                                                    q(".pe3-list").innerHTML = _str;
                                                    q(".pe3").style.display = "flex";
                                                    q(".pe3-close").addEventListener("click", function () {
                                                        q(".pe3").style.display = "none";
                                                    }, false);
                                                }
                                            }
                                        })
                                    }
                                }, false);
                            })
                        }

                    }
                }
            }
        });
    };

    modal.renderCommentList = function() {
        var list = modal.commentList;
        if (list && list.length > 0) {
            var commentHtml = '';
            list.forEach(function (item) {
                commentHtml += '<div class="comment-li" data-id="'+item.commentId+'">\n' +
                    '<div class="comment-li-wrap">' +
                    '                        <img class="comment-l" src="'+item.avatar+'" alt />\n' +
                    '                        <div class="comment-c">\n' +
                    '                            <div class="comment-name">'+item.nickName+'</div>\n' +
                    '                            <div class="comment-con">'+(item.content?item.content:"")+'</div>\n';

                if (item.images) {
                    var imagesArr = item.images.split(",");
                    if (imagesArr && imagesArr.length > 0) {
                        var imageHtml = '<div class="comment-imgs">';
                        for (var i=0;i<imagesArr.length;i++) {
                            imageHtml += '<img class="comment-img swiper-lazy" data-index="'+i+'" data-img="'+item.images+'" src="'+imagesArr[i]+'" alt />';
                        }
                        imageHtml += '</div>';
                        commentHtml += imageHtml;
                    }
                }

                commentHtml += '<div class="comment-fun">\n' +
                    '                <div class="comment-time">'+modal.parseDateForComment(item.createTime)+' · </div>\n' +
                    '                <div class="comment-btn-reply link">回复TA</div>\n' +
                    '                <img class="comment-btn-more link" src="img/icon_more_s.png" alt />\n' +
                    '           </div>';

                commentHtml += '</div>\n' +
                    '           <div class="comment-r link">\n' +
                    '               <img class="comment-like-icon" src="img/icon_like_g.png" alt />\n' +
                    '               <div class="comment-like-num">'+(item.likeCount > 0 ? item.likeCount : "")+'</div>\n' +
                    '           </div>\n' +
                    '       </div>';
                if (item.totalList && item.totalList.length > 0) {
                    var replyHtml = '';
                    replyHtml += '<div class="comment-reply">';
                    item.totalList.forEach(function (item2) {
                        replyHtml += '<div class="cop-li" data-id="'+item2.commentId+'">\n' +
                            '              <img class="cop-l" src="'+item2.avatar+'" alt />\n' +
                            '              <div class="cop-c">\n' +
                            '                   <div class="cop-name">'+item2.nickName+(item2.isAuthor===1?'<span class="cop-author">作者</span>':'')+'</div>\n' +
                            '                   <div class="cop-con">\n' +
                            '                        '+((item2.parentNickName ?"回复<span class=\"link\" style=\"color:#3397C6\"> @"+item2.parentNickName+"</span>：":"") + (item2.content?item2.content:""))+'\n';
                        if (item2.images) {
                            replyHtml += '<span class="cop-con-show-img swiper-lazy" data-index="0" data-img="'+item2.images+'"><img class="cop-con-icon" src="img/icon_img_s.png" alt /><span>查看图片</span></span>\n';
                        }
                        replyHtml += '                   </div>\n' +
                            '                   <div class="cop-fun">\n' +
                            '                        <div class="cop-time">'+modal.parseDateForComment(item2.createTime)+' · </div>\n' +
                            '                        <div class="cop-btn-reply link">回复TA</div>\n' +
                            '                        <img class="cop-btn-more link" src="img/icon_more_s.png" alt />\n' +
                            '                   </div>\n' +
                            '              </div>\n' +
                            '<div class="cop-r link">' +
                            '<img class="cop-like-icon" src="img/icon_like_g.png" alt />' +
                            '<div class="cop-like-num">'+(item2.likeCount > 0 ? item2.likeCount : "")+'</div>'+
                            '</div>'+
                            '         </div>\n';
                    });
                    replyHtml += '</div>';
                    commentHtml += replyHtml;
                }
                if (item.childCommentCount - item.totalList.length > 0) {
                    commentHtml += '<div class="cop-more" data-page="1" data-switch="off" data-id="'+item.commentId+'"><span class="cop-more-text">点击展开'+((item.childCommentCount - item.totalList.length) > 4 ? 5:(item.childCommentCount - item.totalList.length))+'条回复</span><img class="cop-more-btn" src="img/icon_arrow_g2.png" alt /></div>';
                }
                '</div>';

                $("#commentList").html(commentHtml);
            });
        }
    };

    modal.getRoomsList = function (startTime, endTime, foodType, hotelId, cb) {
        let objData = {
            "foodTypeStr": foodType,
            "hotelId": hotelId
        };
        if (startTime) { objData.rentBeginTime = startTime }
        if (endTime) { objData.rentEndTime = startTime }
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/hotel_room_list",
            method: "POST",
            dataType: "json",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            data: JSON.stringify(objData),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    let list = res.json;
                    let roomStr = '';
                    if (list && list.length > 0) {
                        list.forEach(item => {
                            let tagStr = '', typeStr = '';
                            if (item.roomTagName) {
                                let tagArr = item.roomTagName.split(",");
                                if (tagArr && tagArr.length > 0) {
                                    tagArr.forEach(item2 => {
                                        tagStr += `<div class="nli-tag">${item2}</div>`
                                    })
                                }
                            }
                            if (item.reserveTypeStr) {
                                let typeArr = item.reserveTypeStr.split(",");
                                if (typeArr && typeArr.length > 0) {
                                    typeArr.forEach(item3 => {
                                        typeStr += `<div class="nli"><div class="nli-ml"><div class="nli-mlt">${modal.rType[item3].name}</div>
                                                        <div class="nli-mlb">单价<span>￥${item['monthReferPrice'+item3] ? item['monthReferPrice'+item3] : 0}</span>起/${(item3 === "10" ? "人/" : "") + modal.rType[item3].name.slice(-2)}/30晚</div>
                                                    </div><div class="nli-mr">预订</div></div>`;
                                    });
                                }
                            }
                            roomStr += `<div class="room-li" ><div class="nli-t">
                                <img class="nli-tl" src="${item.roomCover}" alt/>
                                <div class="nli-tr">
                                    <div class="nli-tit">${item.roomTitle}</div>
                                    <div class="nli-tags">${tagStr}</div>
                                    <div class="nli-inf">
                                        <div class="nli-inl">
                                            <p>面积约为${item.roomArea}m<sup>2</sup></p>
                                            <p class="nli-inline">不可取消</p>
                                            <p class="nli-inline">需等待确认</p>
                                        </div>
                                        <div class="nli-inr" data-id="${item.roomId}">详情</div>
                                    </div>
                                </div></div>
                                <div class="nli-m">${typeStr}</div></div>
                                `;
                        });
                    }
                    typeof cb === "function" && cb(roomStr);
                }
            }
        });
    };

    modal.onAMapLoaded = function() {
        var map = new AMap.Map("mapContainer", {zoom: 11,});
        console.log(modal);
        AMap.plugin('AMap.Geocoder', function() {
            var geocoder = new AMap.Geocoder();
            // geocoder.getLocation(modal.locationProvinceName + modal.locationCityName + modal.locationTownName, function(status, result) {
            geocoder.getLocation("海南省三亚市", function(status, result) {
                console.log(status, result);
                if (status === 'complete'&&result.geocodes.length) {
                    var lnglat = result.geocodes[0].location;
                    map.setCenter([lnglat.lng, lnglat.lat]);
                    modal.lng = lnglat.lng;
                    modal.lat = lnglat.lat;
                    var marker = new AMap.Marker({
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

                            if (result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                                let list = result.poiList.pois;
                                let disArr = [];
                                list.forEach(function (item) {
                                    disArr.push(item)
                                });
                                modal.distance = disArr;
                                let min = disArr.sort((a, b) => { return a.distance - b.distance })[0];
                                AMap.plugin('AMap.Driving', function() {
                                    var driving = new AMap.Driving({
                                        // 驾车路线规划策略，AMap.DrivingPolicy.LEAST_TIME是最快捷模式
                                        policy: AMap.DrivingPolicy.LEAST_TIME
                                    })

                                    var startLngLat = [min.location.lng, min.location.lat];
                                    var endLngLat = [lnglat.lng, lnglat.lat];

                                    driving.search(startLngLat, endLngLat, function (status, result) {
                                        // 未出错时，result即是对应的路线规划方案
                                        let time = result.routes[0].time;
                                        q("#distance").innerText = `距${min.name}驾车距离${min.distance/1000}公里，约${parseInt(time/60)}分钟`;
                                    })
                                })

                            }
                        });
                    });


                } else {
                    console.log('获取经纬度失败');
                }
            });
        });
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