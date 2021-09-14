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
    modal.id = core.parseQueryString().id;
    var swiper = new Swiper('.swiper-container-bed', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        init: false
    });
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
    function parseTime (timestamp) {
        if (timestamp) {
            var date = new Date(timestamp);
            var y = date.getFullYear().toString().substring(2);
            var m = date.getMonth() + 1;
            var d = date.getDate();
            return y + "年" + m + "月" + d + "日"
        } else {
            return ""
        }
    }
    function parseDateForComment(timestamp) {
        var date = new Date(timestamp);
        return ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()) + " " +
            (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours()) + ":" +
            (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes())
    }
    function getPageSize(page) {
        var _page = parseInt(page);
        if (_page === 1) {
            return 5
        } else {
            return 5
        }
    };

    var pag = q(".swiper-pagination");
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
        url: modal.server[modal.env] + "/xiangdao-api/api/house/details/" + modal.id,
        method: "POST",
        dataType: "json",
        headers: {"Accept": "application/json", "Content-Type": "application/json"},
        data: JSON.stringify({"houseId": modal.id}),
        success: function (res2) {
            console.log(res2);
            var data = res2.json;
            var ownerHouseIsAuthentication = q(".hc-ver");
            var ownerAvatar = q(".hc-user");
            var houseNo = q("#houseNo");
            var profileStr = q("#profileStr");
            var infoTitle = q(".hc-tit");
            var baseIndoorArea = q("#baseIndoorArea");
            var baseOrientation = q("#baseOrientation");
            var baseDecorationDate = q("#baseDecorationDate");
            var ruleRentType = q("#ruleRentType");
            var baseCourtyardArea = q("#baseCourtyardArea");
            var ruleYearMoney = q("#ruleYearMoney");
            var baseLiveNumber = q("#baseLiveNumber");
            var floor = q("#floor");
            var infoBrief = q("#infoBrief");
            var otherDesc = q("#otherDesc");
            var mpConfirm = q("#mpConfirm");

            var houseTypeArr = [null, "层", "卧", "浴", "厨", "卫", "客厅", "餐厅", "书房", "阳台"];
            var bdArr = [
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
            var baseNoiseArr = [null, "靠近小区内主路", "靠近主道", "靠近停车场", "靠近公园或广场", "靠近夜市", "周边较安静", "周边很安静", "靠近飞机场", "靠近小区出入口"];
            var baseSceneryArr = [null, "小区内部", "可见花园", "可见山景", "可见湖景", "可见江景", "可见海景", "可见树林", "可见街景", "可见游泳池", "可见高尔夫球场"];
            // console.log(data);
            // data.baseBedType = "1-1-2,3-1-5,3-2-3";

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
                    q("#headImgs").innerHTML = str;
                    swiper2.update();

                }
            }

            if (data.houseTagName) {
                let houseTagArr = data.houseTagName.split(",");
                if (houseTagArr && houseTagArr.length > 0) {
                    let houseTagStr = '', allTagStr = '';
                    houseTagArr.forEach((item, index) => {
                        if (index < 4) {
                            houseTagStr += `<div class="hc-tag">${item}</div>`;
                        } else {
                            q(".hc-tag-more").style.display = "block";
                        }
                        allTagStr += `<div class="top-tag-pop">${item}</div>`;
                    });
                    q(".hc-tags-l").innerHTML = houseTagStr;
                    q("#allTag").innerHTML = allTagStr;
                    let pe = q(".pe");
                    q(".hc-tags").addEventListener("click", function (){
                        pe && core.fadeIn(pe, pe.q(".pe-main"));
                        lockBg();
                    }, false);
                    q(".pe-close").addEventListener("click", function (){
                        pe && fadeOut(pe, pe.q(".pe-main"));
                        unLockBg();
                    }, false);

                }
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

            var hcInfo2 = q("#hcInfo2");
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

            // 楼层
            if (data.profileHouseTypeFloor) {
                q("#floor").innerText = data.profileHouseTypeFloor.replace(/-/, '~');
            }

            if (data.profileHouseType) {
                let typeArr = [null, "室", "厨", "卫", "厅", "厅", "书房", "阳台"];
                let houseTypeArr = data.profileHouseType.split(",");
                let retArr = [], retStr = '';;
                houseTypeArr.forEach(item => {
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
                        retStr += `/${item.num}${typeArr[item.id]}`
                    }
                });
                retStr = retStr.replace("/", '');
                q("#houseType").innerText = retStr;
            }


            ownerHouseIsAuthentication.style.display = "flex";
            ownerHouseIsAuthentication.innerText = "房源已认证";
            ownerHouseIsAuthentication.classList.add("verified");

            ownerAvatar.src = data.ownerAvatar;
            // houseNo.innerText = data.houseNo;
            profileStr.innerText = data.profileStr;
            infoTitle.innerText = data.infoTitle;
            baseIndoorArea.innerText = data.baseIndoorArea;
            baseOrientation.innerText = data.baseOrientation;
            baseDecorationDate.innerText = new Date(data.baseDecorationDate).getFullYear();
            ruleRentType.innerText = [null, "床位", "独立房间", "整套出租", "整栋出租"][data.ruleRentType];

            let validDate = q("#validDate");
            if (data.ruleValidBeginTime && data.ruleValidEndTime  && validDate) {
                validDate.innerText = `${parseTime(data.ruleValidBeginTime)}~${parseTime(data.ruleValidEndTime)}`
            }

            infoBrief.innerText = data.infoBrief;
            baseLiveNumber.innerText = data.baseLiveNumber;
            if (data.ruleOtherMoneyDesc && data.ruleOtherMoneyDesc !== "undefined") {
                otherDesc.innerText = data.ruleOtherMoneyDesc;
            }

            let infoCover = q("#infoCover");
            if (infoCover && data.infoCover) {
                infoCover.src = data.infoCover;
            }

            let infoTitle2 = q("#infoTitle");
            if (infoTitle2 && data.infoTitle) {
                infoTitle2.innerText = data.infoTitle;
            }


            mpConfirm.addEventListener("click", function () {
                this.parentNode.parentNode.style.display = "none"
            }, false);


            let aqList = data.aqList;
            if (data.aqCount > 2) {
                aqList.length > 2 && (aqList.length = 2);
                $("#askShowAll").show();
            }
            var askHtml = '';
            if (aqList && aqList.length > 0) {
                q(".ask-nodata").style.display = "none";
                aqList.forEach(function (item) {
                    askHtml += `<div class="ask-li">
                                    <div class="ask-l">问</div>
                                    <div class="ask-c">${item.title}</div>
                                    <div class="ask-r">${item.replyCount}个回答</div>
                                </div>`;
                });
                askHtml += '<div class="btn-all">查看全部</div>';
                $("#askList").html(askHtml)
            }


            if (data.baseCourtyardArea > 0) {
                baseCourtyardArea.innerText = data.baseCourtyardArea;
                baseCourtyardArea.parentNode.parentNode.style.display = "flex";
            } else {
                baseCourtyardArea.parentNode.parentNode.style.display = "none";
            }

            if (data.profileHouseIcon && data.profileHouseIconList && data.profileHouseIconList.length > 0) {
                let insStr = '';
                let iconArr = data.profileHouseIcon.split(",");
                data.profileHouseIconList.forEach(item => {
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

            if (~~data.commentCount > 1) {
                q(".comment-btn").style.display = "block";
            } else {
                q(".comment-btn").style.display = "none";
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




        }
    });

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
                    '                <div class="comment-time">'+parseDateForComment(item.createTime)+' · </div>\n' +
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
                            '                        <div class="cop-time">'+parseDateForComment(item2.createTime)+' · </div>\n' +
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

    $(document).off("click").on("click", ".cop-more", function () {
        var $this = $(this);
        var commentId = parseInt($this.data("id"));
        var swi = $this.data("switch");
        var page = parseInt($this[0].dataset.page);
        if (swi === "off") {
            modal.requestReplyList(commentId, getPageSize(page), $this, page);
        } else {
            var commentList = modal.commentList;
            if (commentList && commentList.length > 0) {
                commentList.forEach(function (item) {
                    if (item.commentId === commentId) {
                        var num = item.childCommentCount - item.list.length;
                        var showNum = num > 4 ? 5 : num;
                        $this.find(".cop-more-text").text("点击展开"+showNum+"条回复");
                    }
                })
            }
            $this.data("switch", "off");
            $this.find(".cop-more-btn").removeClass("col");
            $this[0].dataset.page = 1;
            $this.prev(".comment-reply").find(".cop-li-add").remove();
            if (commentList && commentList.length > 0) {
                commentList.forEach(function (item) {
                    if (item.commentId === commentId) {
                        item.totalList = item.list;
                    }
                });
            }
        }
    });
    $(document).on("click", ".full-swiper-slide", function () {
        swiper2.removeAllSlides();
        swiper2.updateSlides();
        swiper2.destroy();
        $("#fullPageImages").hide();
    });
    $(document).on("click", ".comment-img,.cop-con-show-img", function () {
        var imagesArr = $(this).data("img").split(",");
        var current = parseInt($(this).data("index"));
        if (imagesArr && imagesArr.length > 0) {
            swiper2 = new Swiper("#fullPageImages", {
                init: false,
                initialSlide: current,
                lazy: {
                    elementClass : 'swiper-lazy',
                },
            });
            var imagesHtml = '';
            imagesArr.forEach(function (item) {
                imagesHtml += '<div class="swiper-slide full-swiper-slide" style="background: url('+item+') no-repeat center / 100%"></div>';
            });
            q("#fullPageWrap").innerHTML = imagesHtml;
            q("#fullPageImages").style.display = "block";
            swiper2.init();
            swiper2.update();
        }
    });

    modal.requestReplyList = function(commentId, pageSize, $obj, page) {
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/comment/child_list",
            method: "POST",
            dataType: "json",
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({"commentId": commentId, "pageSize": pageSize, "pageNo": page}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var repHtml = '';
                    var repList = res.json.result;
                    var commentList = modal.commentList;
                    if (repList && repList.length > 0) {
                        repList.forEach(function (item3) {
                            commentList.forEach(function (item4) {
                                if (commentId === item4.commentId) {
                                    if (item4.totalList && item4.totalList.length > 0) {
                                        item4.totalList.forEach(function (item5) {
                                            if (item5.commentId === item3.commentId) {
                                                item3.hide = true
                                            }
                                        })
                                    }
                                }
                            })
                        });
                        repHtml += modal.renderReplyList(repList);
                        // $obj.before(repHtml);
                        // $obj.prev(".comment-reply").append(repHtml);
                        var prev = $obj.prev(".comment-reply");
                        if (prev.length > 0) {
                            prev.append(repHtml);
                        } else {
                            $obj.before('<div class="comment-reply">'+repHtml+'</div>');
                        }
                        var linkApp = document.querySelectorAll(".link");
                        if (linkApp && linkApp.length > 0) {
                            for (var z=0;z<linkApp.length;z++) {
                                linkApp[z].addEventListener("click", function () {
                                    openApp();
                                }, false);
                            }
                        }
                    }
                    commentList.forEach(function (item2) {
                        if (item2.commentId === commentId) {
                            item2.totalList = item2.totalList.concat(repList);
                            if (item2.totalList.length < res.json.totalCount) {
                                var num = res.json.totalCount - item2.totalList.length + item2.list.length;
                                var restNum = num > 4 ? 5 : num;
                                $obj.find(".cop-more-text").text("点击展开"+restNum+"条回复");
                                $obj.find(".cop-more-btn").removeClass("col");
                                page++;
                                $obj[0].dataset.page = page;
                            } else {
                                $obj.find(".cop-more-text").text("收起全部回复");
                                $obj.find(".cop-more-btn").addClass("col");
                                $obj.data("switch", "on");
                            }
                        }
                    });

                }
            }
        });
    };

    modal.renderReplyList = function(repList) {
        var repHtml = '';
        repList.forEach(function (item) {
            if (!item.hide) {
                repHtml += '<div class="cop-li cop-li-add" data-id="'+item.commentId+'">\n' +
                    '            <img class="cop-l" src="'+item.avatar+'" alt />\n' +
                    '            <div class="cop-c">\n' +
                    '                 <div class="cop-name">'+item.nickName+(item.isAuthor === 1 ? '<span class="cop-author">作者</span>' : '')+'</div>\n' +
                    '                 <div class="cop-con">\n' +((item.parentNickName ?"回复<span class=\"link\" style=\"color:#3397C6\"> @"+item.parentNickName+"</span>：":"") + (item.content?item.content:""));
                if (item.images) {
                    repHtml += '<span class="cop-con-show-img swiper-lazy" data-index="0" data-img="'+item.images+'"><img class="cop-con-icon" src="img/icon_img_s.png" alt /><span>查看图片</span></span>\n';
                }
                repHtml += '</div>\n' +
                    '                 <div class="cop-fun">\n' +
                    '                      <div class="cop-time">'+parseDateForComment(item.createTime)+' · </div>\n' +
                    '                      <div class="cop-btn-reply link">回复TA</div>\n' +
                    '                      <img class="cop-btn-more link" src="img/icon_more_s.png" alt />\n' +
                    '                 </div>\n' +
                    '            </div>\n' +
                    '<div class="cop-r link">' +
                    '<img class="cop-like-icon" src="img/icon_like_g.png" alt />' +
                    '<div class="cop-like-num">'+(item.likeCount > 0 ? item.likeCount : "")+'</div>'+
                    '</div>'+
                    '       </div>';
            }
        });
        return repHtml;
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
});