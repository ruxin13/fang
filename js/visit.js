require.config({
    paths: {
        'common': 'common.min',
        'swiper': 'swiper-bundle.min',
        'jquery': "jquery-3.2.1",
    }
});

define(['common', 'swiper', 'jquery'], function (core, Swiper, $) {
    core.init();
    var modal = {
        id: core.parseQueryString().id,
        commentList: []
    };

    modal.env = "dev";


    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };


    var swiper1 = new Swiper(".swiper-houses", {
        slidesPerView: 2.5,
        spaceBetween: 10,
        init: false
    });

    var swiper2;

    modal.initTab = function(id) {
        var tits = document.querySelectorAll(".tab-tit");
        var cons = document.querySelectorAll(".tab-con");
        tits[id].classList.add("sel");
        cons[id].classList.add("sel");
    };

    modal.eventBind = function () {
        $(".tab-tit").on("click", function () {
            var $tabCon = $(".tab-con");
            for (var i=0;i<$tabCon.length;i++) {
                if ($(this).data("id") === $tabCon.eq(i).data("id")) {
                    $tabCon.eq(i).addClass("sel");
                    $(this).addClass("sel").siblings(".tab-tit").removeClass("sel");
                } else {
                    $tabCon.eq(i).removeClass("sel")
                }
            }
        });
        $(".pan-cols").on("click", function () {
            $("#content").slideToggle();
            $(this).toggleClass("col")
        });
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

    // 更多回复的列表
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

    modal.dataInit = function () {
        core.request({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/visit_details/" + modal.id,
            method: "GET",
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var data = res.json;
                    if (data) {
                        modal.q("#playVideo").src = data.video;
                        modal.q("#playVideo").poster = data.cover;
                        modal.q("#userAvatar").src = data.userAvatar;
                        modal.q("#userNickName").innerText = data.userNickName;
                        modal.q("#fansCount").innerText = data.likeCount || 0;
                        modal.q("#videoCount").innerText = data.commentCount || 0;
                        modal.q("#title").innerText = data.title;
                        // modal.q("#location").innerText = data.locationCityName + "·" + data.locationTownName;
                        modal.q("#location").innerText = data.locationProvinceName;
                        modal.q("#lookNumber").innerText = data.lookNumber;
                        modal.q("#likeCount").innerText = data.likeCount > 0 ? data.likeCount : "点赞";
                        modal.q("#publishDate").innerText = modal.parseDate(data.publishDate) + "发布";
                        var tags = data.tagName.split(",");
                        if (data.tagName !== "" && tags && tags.length > 0) {
                            var tagHtml = "";
                            tags.forEach(function (item) {
                                tagHtml += '<div class="pan-tag">'+item+'</div>';
                            });
                            modal.q("#tagName").innerHTML = tagHtml;
                        } else {
                            modal.q("#tagName").style.display = "none";
                        }
                        if (data.content) {
                            modal.q("#content").innerText = data.content;
                        } else {
                            modal.q(".pan-cols").style.display = "none";
                        }
                        if (data.locationTown) {
                            $.ajax({
                                url: modal.server[modal.env] + "/xiangdao-api/api/news/visit_list",
                                method: "POST",
                                dataType: "json",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json"
                                },
                                data: JSON.stringify({"code": data.locationTown, "pageSize": 8}),
                                success: function (res2) {
                                    console.log(res2);
                                    if (res2.status === 0) {
                                        var data2 = res2.json.result;
                                        if (data2 && data2.length > 0) {
                                            var listHtml = '';
                                            data2.forEach(function (item2) {
                                                if (parseInt(modal.id) !== item2.visitId) {
                                                    listHtml += '<a class="lli" data-id="'+item2.visitId+'" href="visit.html?id='+item2.visitId+'">\n' +
                                                        '                                <div class="lli-l">\n' +
                                                        '                                    <img class="lli-img" src="'+item2.cover+'" alt />\n' +
                                                        '                                    <div class="lli-time">'+item2.videoDuration+'</div>\n' +
                                                        '                                </div>\n' +
                                                        '                                <div class="lli-r">\n' +
                                                        '                                    <div class="lli-tit">'+item2.title+'</div>\n' +
                                                        '                                    <div class="lli-stit">'+(item2.userNickName?item2.userNickName:'')+'<span>'+item2.lookNumber+'</span>次观看</div>\n' +
                                                        '                                </div>\n' +
                                                        '                            </a>'
                                                }
                                            });
                                            modal.q("#tales").innerHTML = listHtml;
                                            if (listHtml === '') {
                                                modal.q("#relationStory").style.display = "none";
                                            }
                                        } else {
                                            modal.q("#relationStory").style.display = "none";
                                        }
                                    } else {
                                        modal.q("#relationStory").style.display = "none";
                                    }
                                }
                            });
                        }
                        var rList = data.list;
                        if (rList && rList.length > 0) {
                            var houseHtml = "";
                            rList.forEach(function (item) {
                                houseHtml += '<a class="swiper-slide" data-id="'+item.houseId+'" href="house_details.html?houseId='+item.houseId+'">\n' +
                                    '             <img class="roll-slide-img" src="'+item.infoCover+'" alt />\n' +
                                    '             <div class="roll-slide-stit">'+item.profileStr+'</div>\n' +
                                    '             <div class="roll-slide-tit">'+item.infoTitle+'</div>\n' +
                                    '         </a>'
                            });
                            modal.q("#houseList").innerHTML = houseHtml;
                            swiper1.init();
                            if (houseHtml === '') {
                                modal.q("#relationHouses").style.display = "none";
                            }
                        } else {
                            modal.q("#relationHouses").style.display = "none";
                        }
                    }

                }
            }
        });

        // core.request({
        //     url: modal.server[modal.env] + "/xiangdao-api/api/news/tale/" + modal.id + "/house_list",
        //     method: "GET",
        //     success: function (res) {
        //         console.log(res);
        //         if (res.status === 0) {
        //             var data = res.json;

                // } else {
                //     modal.q("#relationHouses").style.display = "none";
                // }
            // }
        // });

        $.ajax({
            url: modal.server[modal.env] + "/xiangdao-api/api/news/new_comment_list",
            method: "POST",
            dataType: "json",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify({"bizId": modal.id, "bizType": 6}),
            success: function (res) {
                console.log(res);
                if (res.status === 0) {
                    var list = res.json.result;
                    modal.commentList = list;
                    if (list && list.length > 0) {
                        modal.q("#commentNum").innerText = res.json.totalCount;

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

    modal.init = function () {
        modal.initTab(0);
        modal.eventBind();
        modal.dataInit();

    };

    modal.init();




});