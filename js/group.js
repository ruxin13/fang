require.config({
    paths: {
        'common': 'common.min',
        'swiper': 'swiper-bundle.min',
        'jquery': "jquery-3.2.1"
    }
});

define(['common', 'swiper', 'jquery'], function (core, Swiper, $) {
    core.init();
    var modal = {
        id: core.parseQueryString().id,
        commentList: [],
    };
    modal.env = "dev";

    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };

    modal.swapArray = function(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };

    modal.eventBind = function () {
        $(document).off("click").on("click", ".cop-more", function () {
            var $this = $(this);
            var commentId = parseInt($this.data("id"));
            var swi = $this.data("switch");
            var page = parseInt($this[0].dataset.page);
            if (swi === "off") {
                modal.requestReplyList(commentId, modal.getPageSize(page), $this, page);
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
                modal.q("#fullPageWrap").innerHTML = imagesHtml;
                modal.q("#fullPageImages").style.display = "block";
                swiper2.init();
                swiper2.update();
            }
        });
        $(".top-tags-r").on("click", function () {
            $(".pe").css("display", "flex");
        });
        $(".pe-close").on("click", function () {
            $(".pe").css("display", "none");
        });
    };
    modal.q = function(selector) {
        return document.querySelector(selector)
    };
    modal.getPageSize = function(page) {
        var _page = parseInt(page);
        if (_page === 1) {
            return 5
        } else {
            return 5
        }
    };
    modal.parseDate = function(timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear() + "-" + ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate())
    };
    modal.parseDateForComment = function(timestamp) {
        var date = new Date(timestamp);
        return ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()) + " " +
            (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours()) + ":" +
            (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes())
    };
    modal.parseDateToStr = function(timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日"
    };


    modal.init = function () {
        modal.eventBind();
        modal.initSwiper();
        modal.initPageData();
        modal.onAMapLoaded();
    };

    modal.initPageData = function() {
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/tuan/group_details",
            method: "POST",
            dataType: "json",
            async: false,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({"groupId": modal.id}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var data = res.json;

                    modal.locationCity = data.locationCity;
                    modal.locationDetail = data.locationDetail;
                    modal.locationProvinceName = data.locationProvinceName;
                    modal.locationCityName = data.locationCityName;
                    modal.locationTownName = data.locationTownName;

                    var villageName = modal.q(".top-tit");
                    var villageNo = modal.q("#villageNo");
                    var tagWrap = modal.q(".top-tags-l");
                    var tagWrapPop = modal.q(".pe-list");
                    var brief = modal.q(".top-sif-l");
                    var startEnd = modal.q(".top-srf-r");
                    var restTime = modal.q(".m-tit-rm");
                    var headImgs = modal.q("#headImgs");
                    var houseDesc = modal.q("#houseDesc");

                    var headStr = '';
                    if (data.video) {
                        headStr += '<div class="swiper-slide"><video id="video" class="head-video-li" preload="auto" controls ' +
                            ' webkit-playsinline="true"\n' +
                            ' playsinline="true"\n' +
                            ' x5-playsinline="true"\n' +
                            ' x5-video-player-type="h5"\n' +
                            ' x5-video-player-fullscreen=""\n' +
                            ' x5-video-orientation="portraint"\n' +
                            ' x-webkit-airplay="true"\n' +
                            ' controlsList="nodownload"' +
                            ' controls="controls"' +
                            ' src="' + data.video + '" poster="' + data.videoGif + '" /></div>';
                    }
                    if (data.briefImages) {
                        var briefImagesArr = data.briefImages.split(",");
                        briefImagesArr.forEach(function (item) {
                            headStr += '<div class="swiper-slide"><img class="head-img-li" src="'+item+'" alt/></div>';
                        });
                    }
                    headImgs.innerHTML = headStr;
                    modal.swiper2.update();

                    villageName.innerText = data.villageName;
                    villageNo.innerText = data.villageNo;
                    if (data.tagName) {
                        var tagArr = data.tagName.split(",");
                        var tagStr = '';
                        var allTagStr = '';
                        tagArr.forEach(function (item, index) {
                            if (index < 4) {
                                tagStr += '<div class="top-tag">'+item+'</div>';
                            } else {
                                modal.q(".top-tags-r").style.display = 'block'
                            }
                            allTagStr += '<div class="top-tag-pop">'+item+'</div>';
                        });
                        tagWrap.innerHTML = tagStr;
                        tagWrapPop.innerHTML = allTagStr;
                    }
                    if (data.brief && brief) {
                        brief.innerText = data.brief;
                    }

                    if (data.tuanBeginTime && data.tuanEndTime && startEnd) {
                        startEnd.innerText = modal.parseDateToStr(data.tuanBeginTime) + "-" + modal.parseDateToStr(data.tuanEndTime);
                    }

                    if (houseDesc && data.content) {
                        houseDesc.innerHTML = data.content;
                        setTimeout(function () {
                            var conMore = modal.q(".desc-more");
                            var conCon = modal.q(".desc-con");
                            if (conMore) {
                                if ((houseDesc.clientHeight / rem) > 8) {
                                    conMore.classList.add("show");
                                    conCon.classList.remove("showAll");
                                } else {
                                    conMore.classList.remove("show");
                                    conCon.classList.add("showAll");
                                    conMore.style.display = 'none';
                                }
                            }
                        }, 1000);
                    }

                    if (data.surplusTimestamp && data.surplusTimestamp > 0) {
                        modal.surplusTimestamp = data.surplusTimestamp;
                        restTime.innerHTML = modal.formatTime(data.surplusTimestamp);
                        var int = setInterval(function () {
                            var newTime = modal.surplusTimestamp - 1;
                            restTime.innerHTML = modal.formatTime(newTime > 0 ? newTime : 0);
                            modal.surplusTimestamp = newTime;
                            if (newTime <= 0) {
                                clearInterval(int);
                            }
                        }, 1000);
                    }

                    if (data.list && data.list.length > 0) {
                        var hStr = '';
                        data.list.forEach(function (item) {


                            hStr += '<div class="group-li '+(item.status === 2 ? 'gl-out' : '')+'" data-id="'+item.tuanId+'">\n' +
                                '                <img class="gli-l" src="'+item.infoCover+'" alt/>\n' +
                                '                <div class="gli-r">\n' +
                                '                    <div class="gli-tit">'+item.infoTitle+'</div>\n' +
                                '                    <div class="gli-tags">\n';

                            if (item.tagName) {
                                var tagStr = '';
                                var tagArr = item.tagName.split(",");
                                tagArr.forEach(function (item2, index2) {
                                    if (index2 < 3) {
                                        tagStr += '<div class="gli-tag">'+item2+'</div>';
                                    }
                                });
                                hStr += tagStr;
                            }

                            hStr += '</div>\n' +
                            '<div class="gli-price">拼团价：<i>￥</i><span>'+(item.tuanPrice ? item.tuanPrice : 0)+'</span></div>\n' +
                            '<div class="gli-inf">'+(item.reserveTypeStr.indexOf("1") > -1 ? "人/日/床位/包吃住" : "日/整间房/包吃住" )+'</div><a class="gli-od gli-in" href="group_detail.html?id='+item.tuanId+'">订</a></div></div>';
                        });
                        modal.q(".group-con").innerHTML = hStr;

                    }

                    if (data.villageIcon) {
                        core.request({
                            url: modal.server[modal.env] + "/xiangdao-api/api/houseEditor/get_village_icon_group",
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
                                            } else if (len < 3) {
                                                $(istR[m]).addClass("align-center");
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
                                    } else {
                                        $("#insMore").parents(".pan").hide();
                                    }



                                }
                            }
                        });
                    } else {
                        $("#insMore").parents(".m-ist").hide();
                    }

                    if (data.mustSee) {
                        modal.q("#mustSee").innerHTML = data.mustSee;
                    } else {
                        modal.q("#mustSee").parentNode.style.display = 'none'
                    }


                    if (data.hotelPolicy) {
                        modal.q("#hotelPolicy").innerHTML = data.hotelPolicy;
                    } else {
                        modal.q("#hotelPolicy").parentNode.style.display = 'none'
                    }

                    $.ajax({
                        url: modal.server[modal.env] + "/xiangdao-api/api/news/new_comment_list",
                        method: "POST",
                        dataType: "json",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        data: JSON.stringify({"bizId": data.villageId, "bizType": 1}),
                        success: function (res) {
                            console.log(res);
                            if (res.status === 0) {
                                var list = res.json.result;
                                modal.commentList = list;
                                if (list && list.length > 0) {
                                    // modal.q("#commentNum").innerText = res.json.totalCount;

                                    list.forEach(function (item) {
                                        item.totalList = item.list;
                                    });

                                    modal.renderCommentList();





                                    var linkApp = document.querySelectorAll(".link");
                                    if (linkApp && linkApp.length > 0) {
                                        for (var z=0;z<linkApp.length;z++) {
                                            linkApp[z].addEventListener("click", function () {
                                                openApp();
                                            }, false);
                                        }
                                    }
                                } else {
                                    var html = '';
                                    html += '<div class="comment-nodata">' +
                                        '<img class="comment-nodata-icon" src="img/comment_nodata.png" alt />' +
                                        '<div class="comment-nodata-tit">暂无消息</div>' +
                                        '<div class="comment-nodata-stit">暂时还没收到任何消息</div></div>';
                                    modal.q("#comment").innerHTML = html;
                                }
                            }
                        }
                    });


                }
            }
        });
    };

    modal.initSwiper = function() {
        var pag = modal.q("#pag");
        modal.swiper2 = new Swiper('.top-swiper-container', {
            pagination: {
                el: '.top-swiper-pagination',
                type: 'fraction',
            },
            on: {
                transitionEnd: function () {
                    var videos = document.querySelectorAll("video");
                    if (videos && videos.length > 0) {
                        for (var i = 0; i < videos.length; i++) {
                            videos[i].pause();
                        }
                    }
                }
            }
        });
    };

    modal.formatTime = function(time) {
        var day = parseInt(time / 86400);
        var hour = parseInt(time % 86400 / 3600);
        var minute = parseInt(time % 3600 / 60);
        var second = parseInt(time % 60);
        if (hour < 10) {hour = "0" + hour}
        if (minute < 10) {minute = "0" + minute}
        if (second < 10) {second = "0" + second}
        return (day > 0 ? ('<i>' + day + "</i>天") : "") + '<i>'+hour+'</i>:' + '<i>'+minute+'</i>:' + '<i>'+second+'</i>'
    };

    modal.requestReplyList = function(commentId, pageSize, $obj, page) {
        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/new_comment_child_list",
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
                    '                      <div class="cop-time">'+modal.parseDateForComment(item.createDate)+' · </div>\n' +
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
                    '                <div class="comment-time">'+modal.parseDateForComment(item.createDate)+' · </div>\n' +
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
                            '                        <div class="cop-time">'+modal.parseDateForComment(item2.createDate)+' · </div>\n' +
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
    var conShowAll = document.querySelector(".desc-more");
    if (conShowAll) {
        conShowAll.addEventListener("click", function () {
            var isShow = this.dataset.stat;
            if (isShow === "1") {
                this.querySelector(".desc-more-img").classList.remove("up");
                modal.q("#houseDesc").classList.remove("showAll");
                this.querySelector(".desc-more-txt").innerText = "查看全部";
                this.classList.add("show");
                this.dataset.stat = "2";
            } else {
                modal.q("#houseDesc").classList.add("showAll");
                this.querySelector(".desc-more-img").classList.add("up");
                this.querySelector(".desc-more-txt").innerText = "收起";
                this.classList.remove("show");
                this.dataset.stat = "1";
            }

        }, false);
    }

    modal.onAMapLoaded = function() {
        var map = new AMap.Map("mapContainer", {zoom: 11,});
        AMap.plugin('AMap.Geocoder', function() {
            var geocoder = new AMap.Geocoder();
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
        });
    };


    modal.init();

});