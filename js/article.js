require.config({
    paths: {
        'common': 'common.min',
        'jquery': "jquery-3.2.1"
    }
});
define(['common', 'jquery'], function (core, $) {
    var modal = {};

    core.init();

    modal.env = "dev";


    modal.server = {
        "dev": "//dev.xiangdao.info",
        "pro": "//www.xiangdao.info"
    };
    modal.parseDate = function(timestamp) {
        var date = new Date(timestamp);
        return date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日"
    };
    modal.parseDateComment = function(timestamp) {
        var date = new Date(timestamp);
        return ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1)) + "-" +
            (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate()) + " " +
            (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours()) + ":" +
            (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes())
    };
    modal.q = function(selector) {
        return document.querySelector(selector)
    };
    modal.id = core.parseQueryString().articleid;
    console.log(modal);


    $.ajax({
        url: modal.server[modal.env] + "/xiangdao-api/api/news/article_details/" + modal.id,
        method: "POST",
        dataType: "json",
        headers: {"Accept": "application/json", "Content-Type": "application/json"},
        data: JSON.stringify({"articleId": modal.id}),
        success: function (res) {
            console.log(res);
            var data = res.json;
            var headImg = modal.q(".header-img");
            var title = modal.q(".articleTitle");
            var publishTime = modal.q(".articleTime");
            var viewNum = modal.q(".viewNum");
            var articleContent = modal.q("#articleContent");
            var like = modal.q(".icon-praise");
            // var commentCount = modal.q("#commentCount");
            var likeCount = modal.q(".pr-txt span");
            headImg.src = data.detailsCover;
            title.innerText = data.title;
            data.publishDate && (publishTime.innerText = "发布于" + modal.parseDate(data.publishDate));
            data.lookNumber && (viewNum.innerText = data.lookNumber + "次观看");
            if (data.publishDate && data.lookNumber) {
                publishTime.innerText += " | ";
            }
            articleContent.innerHTML = data.content;
            likeCount.innerText = data.likeCount;
            // commentCount.innerText = data.commentCount;
            if (data.isLike) {
                like.src = "img/praised.png"
            } else {
                like.src = "img/praise.png"
            }


            // /xiangdao-api/api/news/article/{articleId}/house_list
            // $.ajax({
            //     url: modal.server[modal.env] + "/xiangdao-api/api/news/article/"+modal.id+"/house_list",
            //     method: "GET",
            //     dataType: "json",
            //     success: function (res3) {
            //         console.log(res3);
            //         if (res3.status === 0) {
            //             var list = res3.json;
            //             if (list && list.length > 0) {
            //                 var vpStr = '';
            //                 list.forEach(function (item) {
            //                     vpStr += '<div class="vp-li" data-id="'+item.houseId+'">\n' +
            //                         '                <img class="vp-l" src="'+item.infoCover+'" alt />\n' +
            //                         '                <div class="vp-r">\n' +
            //                         '                    <div class="vp-st">'+item.profileStr+'</div>\n' +
            //                         '                    <div class="vp-ti">'+item.infoTitle+'</div>\n' +
            //                         '                    <div class="vp-price"><span>￥<i>'+item.ruleMonthMoney+'</i></span>/月</div>\n' +
            //                         '                </div>\n' +
            //                         '            </div>'
            //                 });
            //                 modal.q(".vp-list").innerHTML = vpStr;
            //                 if (list.length === 1) {
            //                     modal.q(".vp-list").style.height = "2.32rem";
            //                     modal.q(".show-all").style.display = "none";
            //                 } else if (list.length === 2){
            //                     modal.q(".show-all").style.display = "none";
            //                     modal.q(".vp-list").style.height = "5.6rem"
            //                 } else {
            //                     modal.q(".vp-list").style.height = "5.6rem"
            //                 }
            //                 $(".vp-li").on("click", function () {
            //                     var id = $(this).data("id");
            //                     location.href = "house_details.html?houseId=" + id
            //                 });
            //             } else {
            //                 modal.q(".vp-wrap").style.display = "none"
            //             }
            //         }
            //
            //     }
            // });



            $.ajax({
                url: modal.server[modal.env] + "/xiangdao-api/api/comment/list",
                method: "POST",
                dataType: "json",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({"bizId": modal.id, "bizType": 2, "pageNo": 1}),
                success: function (res2) {
                    console.log(res2);
                    var commentList = res2.json.result;
                    var html2 = '';
                    if (commentList && commentList.length > 0) {
                        modal.q("#commentCount").innerText = " · " + res2.json.totalCount;
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
                                        '                                    <div class="clr-fl">'+modal.parseDateComment(item3.createTime)+'</div>\n' +
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
                                '                        <div class="cf-l">'+modal.parseDateComment(item.createTime)+'</div>\n' +
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
            });

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


});