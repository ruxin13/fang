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
            10: { name: "单人订床位", sn: "床位" },
            11: { name: "整间房单人入住", sn: "整间" },
            12: { name: "整间房双人入住", sn: "整间"  },
            13: { name: "整间房三人入住", sn: "整间"  },
            14: { name: "整间房四人入住", sn: "整间"  },
            20: { name: "订整间", sn: "整间"  },
            30: { name: "整套房间", sn: "整套"  },
            40: { name: "订整栋", sn: "整栋"  }
        },
        al: []
    };
    modal.env = "pro";
    modal.videoIndexArr = [];
    let params = core.parseQueryString();
    modal.type = params.type === "2" ? "2,3" : "1";
    modal.roomId = params.roomId;

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

    function fadeOut(el, el2, cb) {
        el.style.opacity = 1;
        el2 && (el2.style.transform = 'scale(1)');
        (function fade() {
            var val = parseFloat(el.style.opacity);
            if ((el.style.opacity -= .1) < 0) {
                el.style.display = 'none';
                typeof cb === 'function' && cb();
            } else {
                requestAnimationFrame(fade);
                el2 && (el2.style.transform = 'scale(' + (.6 + val / 5) + ')');
            }
        })();
    }

    modal.init = function () {


        modal.getBed(modal.roomId, function () {
            modal.bindTag2();
        })

    };


    modal.bindTag2 = function (){
        let moreRoomTags = q(".dmt-tags");
        let closeMoreRoomTags = q(".pe2-close");
        if (moreRoomTags) {
            moreRoomTags.addEventListener("click", PeFadeIn2, false);
        }
        if (closeMoreRoomTags) {
            closeMoreRoomTags.addEventListener("click", PeFadeOut2, false);
        }
    };

    function PeFadeIn2() {
        lockBg();
        let pe = q(".pe2");
        pe && core.fadeIn(pe, pe.q(".pe2-main"));
    }

    function PeFadeOut2() {
        unLockBg();
        let pe = q(".pe2");
        pe && fadeOut(pe, pe.q(".pe2-main"));
    }



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

                                            str += '<div class="swiper-slide">';
                                            if (item.type === 1) {
                                                str += '<video id="video' + item.id + '" class="head-video-li" preload="auto" ' +
                                                    ' webkit-playsinline="true"' +
                                                    ' playsinline="true"' +
                                                    ' x5-playsinline="true"' +
                                                    ' x5-video-player-type="h5"' +
                                                    ' x5-video-player-fullscreen=""' +
                                                    ' x5-video-orientation="portraint"' +
                                                    ' x-webkit-airplay="true"' +
                                                    ' controlsList="nodownload"' +
                                                    ' preload="auto"' +
                                                    ' autoplay' +
                                                    ' loop' +
                                                    ' controls' +
                                                    ' muted' +
                                                    ' src="' + item2 + '" poster="' + item2 + '?vframe/jpg/offset/2/w/640/h/360" />';
                                                modal.videoIndexArr.push({"index": index2, "item": item2, "id": item.id});
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
                            q("#headImgs").innerHTML = str;
                            swiper3 = new Swiper('.swiper-container-head', {
                                pagination: {
                                    el: '.swiper-pagination-pop',
                                    type: 'fraction'
                                },
                                lazy: true,
                                observer:true,//修改swiper自己或子元素时，自动初始化swiper
                                observeParents:true,//修改swiper的父元素时，自动初始化swiper
                                // autoplay: {
                                //     delay: 3000,
                                //     disableOnInteraction: false,
                                // },
                                on: {
                                    transitionEnd: function () {
                                        var _this = this;
                                        if (modal.videoIndexArr.length > 0) {
                                            modal.videoIndexArr.forEach(function (item) {
                                                if (item.index === _this.activeIndex) {
                                                    pag.classList.add("video");
                                                    let _videoEl = q(`#video${item.id}`);
                                                    if (_videoEl && _videoEl.src) {
                                                        _videoEl.play();
                                                    }
                                                } else {
                                                    pag.classList.remove("video");
                                                    let _videoEl = q(`#video${item.id}`);
                                                    if (_videoEl && _videoEl.src) {
                                                        _videoEl.pause();
                                                    }
                                                }
                                            })
                                        } else {
                                            pag.classList.remove("video")
                                        }
                                    }
                                }
                            });
                            let topVideo = q(".head-video-li");
                            if (topVideo) {
                                topVideo.onplay = function () {
                                    topVideo.muted = false;
                                }
                            }
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
                        if (tagArr.length > 4) {
                            tagStr += `<img class="dmt-tag-more" src="img/icon_arrow_rs.png" alt />`;
                        }
                        q("#roomTags").innerHTML = tagStr;
                        tagWrapPop.innerHTML = allTagStr;
                    } else {
                        q("#roomTags").style.display = "none";
                    }

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
                        hcInfo2.innerHTML = `<div class="hci-tli-wrap swiper-slide">
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
                        bdArr.forEach(function (item) {
                            if (item.bed.length > 0) {
                                let hcHtml = ``;
                                let bedNum = 0;
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
                    $(".dp-mc").scroll(function () {
                        let scrollTop = this.scrollTop || document.body.scrollTop;
                        if (modal.videoIndexArr && modal.videoIndexArr.length > 0) {
                            modal.videoIndexArr.forEach(item => {
                                let _el = q("#video" + item.id);
                                if (_el && scrollTop > _el.clientHeight) {
                                    _el.pause();
                                }
                            })
                        }
                    });

                    typeof cb === "function" && cb();
                }
            }
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