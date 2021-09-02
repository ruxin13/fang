window.GearDate = (function () {
    let GearDate = function () {
        this.scrollTop = 0;
        this.selectedArray = [];
        this.startValue = "";
        this.endValue = "";
        this.clickTag = 0;
        Element.prototype.ca = function (cls) { return cls ? this.classList.add(cls) : false };
        Element.prototype.cm = function (cls) { return cls ? this.classList.remove(cls) : false };
        Element.prototype.cc = function (cls) { return cls ? this.classList.contains(cls) : false };
    }
    function q(selector) { return document.querySelector(selector) }
    function qa(selector) { return document.querySelectorAll(selector) }
    const START_CLASS = "gde-sel-start";
    const CENTER_CLASS = "gde-sel-center";
    const END_CLASS = "gde-sel-end";
    const DISABLED_CLASS = "gde-head-disabled";
    const START_STRING = "请选择入住日期";
    const END_STRING = "请选择退房日期";
    const DATE_STRING = "请选择日期";
    function translateMonth (month) {
        month = ~~month;
        return ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][month]
    }
    function translateDay (day) {
        day = ~~day;
        return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][day]
    }
    function isLeapYear (year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    }
    function dayToArray (startDate, endDate) {
        let startArr = startDate.split("-");
        let endArr = endDate.split("-");
        let start = new Date(startArr[0], ~~startArr[1] - 1, startArr[2]);
        let end = new Date(endArr[0], ~~endArr[1] - 1, endArr[2]);
        let retArr = [];
        if (end > start) {
            let days = (end.getTime() - start.getTime()) / 86400000 ;
            for (let i=0;i<=days;i++) {
                let obj = {};
                if (i === 0) {
                    obj.isStart = true
                } else if (i === days) {
                    obj.isEnd = true
                } else {
                    obj.isCenter = true
                }
                obj.date = start.getTime() + 86400000 * i;
                retArr.push(obj)
            }
        }
        return retArr;
    }
    function dateToStr (date, noGap) {
        if (date instanceof Date) {
            return ymdToStr(date.getFullYear(), date.getMonth(), date.getDate(), noGap);
        } else {
            return ""
        }
    }
    function ymdToStr (y, m, d, noGap) {
        m = ~~m + 1;
        if (m < 10) { m = `0${m}` }
        if (d < 10) { d = `0${d}` }
        if (noGap) {
            return `${y}${m}${d}`
        } else {
            return `${y}-${m}-${d}`
        }
    }
    GearDate.prototype = {
        init: function (params) {
            this.params = params;
            this.startInput = q(params.startInput);
            this.endInput = q(params.endInput);
            this.totalDaysEl = q(params.totalDays);
            this.trigger = q(params.trigger);
            this.totalMonth = params.totalMonth || 12;
            if (this.startValue && this.endValue) {
                if (this.startInput.value && this.endInput.value) {
                    this.startValue = this.startInput.value;
                    this.endValue = this.endInput.value;
                    this.selectedArray = dayToArray(this.startValue, this.endValue);
                }
            }
            this.bindEvent();
        },
        bindEvent: function () {
            let _self = this;
            function popupArea() {
                _self.lockBg();
                const now = new Date();
                let currentYear = now.getFullYear();
                const currentMonth = now.getMonth();
                const currentDate = now.getDate();
                const today = new Date(currentYear, currentMonth, currentDate);
                let monthHeadHtml = "", dayHeadHtml = "", monthHtml = "";
                for (let i=0;i<_self.totalMonth;i++) {
                    let month = currentMonth + i;
                    let yPlus = false;
                    if (month > 11) { yPlus = !yPlus }
                    for (let k=0;k<Math.ceil(_self.totalMonth / 12);k++) {
                        if (month > 11) {
                            month-= 12;
                        }
                    }
                    monthHeadHtml += `<div class="gde-head-mon ${i === 0 ? 'gde-month-cur' : ''}" data-y="${yPlus ? (currentYear + Math.floor((i + currentMonth) / 12)) : currentYear}"
                        data-m="${month % 12}" data-index="${i}">${translateMonth(month % 12)}月</div>`;
                }
                for (let m=0;m<7;m++) {
                    dayHeadHtml += `<div class="gde-head-d ${m === 0 || m === 6 ? 'gde-weekend' : ''}">${translateDay(m)}</div>`
                }
                for (let i=0;i<_self.totalMonth;i++) {
                    monthHtml += '<div class="gde-month">';
                    let _month = currentMonth + i;
                    let _year = currentYear;
                    let _firstDateDay = new Date(_year, _month, 1).getDay();
                    for (let s=0;s<Math.ceil(_self.totalMonth);s++) {
                        if (_month > 11) {
                            _month -= 12;
                            _year++;
                        }
                    }
                    let _monthStr = _month + 1;
                    if (_monthStr < 10) { _monthStr = `0${_monthStr}` }
                    monthHtml += `<div class="gde-head-ym" id="M${_year}${_monthStr}">${_year}年${_month + 1}月</div>`;
                    monthHtml += '<div class="gde-dates">';
                    let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    if (isLeapYear(_year)) { daysInMonth[1] = 29 }
                    for (let m=0;m<_firstDateDay;m++) {
                        monthHtml += `<div class="gde-mdd-emp"></div>`;
                    }
                    for (let j=0;j<daysInMonth[_month];j++) {
                        let otherClass = '';
                        let _thisDay = new Date(_year, _month, j + 1);
                        if (_thisDay < today) {
                            otherClass = 'gde-out';
                        } else if (_self.startValue && _self.endValue) {
                            if (_self.selectedArray.length > 0) {
                                for (let k=0;k<_self.selectedArray.length;k++) {
                                    let dateObj = new Date(_self.selectedArray[k].date);
                                    if (dateObj.getFullYear() === _year && dateObj.getMonth() === _month && dateObj.getDate() === j + 1) {
                                        if (_self.selectedArray[k].isStart) {
                                            otherClass = START_CLASS;
                                        } else if (_self.selectedArray[k].isCenter) {
                                            otherClass = CENTER_CLASS;
                                        } else if (_self.selectedArray[k].isEnd) {
                                            otherClass = END_CLASS;
                                        }
                                    }
                                }
                            }
                        }
                        let _dateStr = ymdToStr(_year, _month, j + 1, true);
                        monthHtml += `<div class="gde-mdd ${otherClass}" data-y="${_year}" data-m="${_month}" data-d="${j + 1}" id="D${_dateStr}">${j + 1}</div>`;
                    }
                    monthHtml += '</div></div>';
                }


                _self.gearArea = document.createElement("div");
                _self.gearArea.className = "gde";
                _self.gearArea.innerHTML =
                    `<div class="gde-mask"></div>
                        <div class="gde-main">
                            <div class="gde-top">
                                <div class="gde-reset" id="gdeReset">重置</div>
                                <div class="gde-tit">预订日期</div>
                                <img class="gde-close" src="img/icon_close.png" alt />
                            </div>
                            <div class="gde-ret">
                                <div class="gde-ret-l">
                                    <div class="gde-ret-t">入住时间</div>
                                    <div class="gde-ret-b" id="startDateMirror">${ _self.startInput ? (_self.startInput.value ? _self.startInput.value : DATE_STRING) : ''}</div>
                                </div>
                                <div class="gde-ret-c" id="totalDaysMirror">${_self.totalDaysEl ? (_self.totalDaysEl.innerText ? _self.totalDaysEl.innerText.replace(/^\d/, "") : "-") : ""}</div>
                                <div class="gde-ret-r">
                                    <div class="gde-ret-t">离开时间</div>
                                    <div class="gde-ret-b" id="endDateMirror">${_self.endInput ? (_self.endInput.value ? _self.endInput.value : DATE_STRING) : ''}</div>
                                </div>
                            </div>
                            <div class="gde-head-year">
                                <img class="gde-head-yl ${DISABLED_CLASS}" id="prevYear" src="img/icon_arrow_down.png" alt />
                                <div class="gde-head-yn">${currentYear}年</div>
                                <img class="gde-head-yr" id="nextYear" src="img/icon_arrow_down.png" alt />
                            </div>
                            <div class="gde-head-month">${monthHeadHtml}</div>
                            <div class="gde-head-day">${dayHeadHtml}</div>
                            <div class="gde-body">${monthHtml}</div>
                            <div class="gde-btn-confirm gde-disabled" id="gdeNext">${START_STRING}</div>
                        </div>`;
                document.body.appendChild(_self.gearArea);
                q(".gde").ca("slideIn");
                const _body = q(".gde-body");
                const gdeNext = q("#gdeNext");
                let yearShow = q(".gde-head-yn");
                let prevYear = q("#prevYear");
                let nextYear = q("#nextYear");
                if (_self.startValue && _self.endValue) {
                    let _startYear = ~~_self.startValue.split("-")[0];
                    let startValueArr = _self.startValue.split("-");
                    let targetMonthHead = q(`#M${startValueArr[0]}${startValueArr[1]}`);
                    if (targetMonthHead) { _body.scrollTo(0, targetMonthHead.offsetTop - _body.offsetTop) }
                    if (yearShow) { yearShow.innerText = `${_startYear}年` }
                    if (_startYear > currentYear) { prevYear.cm(DISABLED_CLASS) }
                    let _nextFY = ~~_self.endValue.split("-")[0];
                    let _nextFYEl = q(`#M${_nextFY + 1}01`);
                    if (_nextFY && _nextFYEl) {
                        nextYear.cm(DISABLED_CLASS)
                    } else {
                        nextYear.ca(DISABLED_CLASS)
                    }
                    gdeNext.cm("gde-disabled");
                    gdeNext.innerText = "完成";
                    gdeNext.addEventListener("click", function () {
                        if (!this.cc("gde-disabled")) {
                            _self.startInput && (_self.startInput.value = _self.startValue);
                            _self.endInput && (_self.endInput.value = _self.endValue);
                            _self.selectedArray = dayToArray(_self.startValue, _self.endValue);
                            _self.close();
                        }
                    }, false);
                }

                let months = qa(".gde-head-mon");
                let tits = qa(".gde-head-ym");
                if (months && months.length > 0) {
                    let changeTitLock = false, targetIndex = 0;
                    months.forEach(function (item) {
                        item.addEventListener("click", function () {
                            changeTitLock = true;
                            let {y, m} = item.dataset;
                            targetIndex = item.dataset.index;
                            let selected = qa(".gde-month-cur");
                            if (selected && selected.length > 0) {
                                selected.forEach(function (item2) {
                                    item2.cm("gde-month-cur");
                                });
                            }
                            item.ca("gde-month-cur");
                            let _monthStr = ~~m + 1;
                            if (_monthStr < 10) { _monthStr = `0${_monthStr}` }

                            // ios的平滑滚动，因为有小bug,所以暂时不放出来
                                // let targetElemPosition = q(`#M${y}${_monthStr}`).offsetTop - _body.offsetTop
                                // if (typeof window.getComputedStyle(document.body).scrollBehavior == "undefined") {
                                //     let scrollTop = _body.scrollTop;
                                //     const step = function() {
                                //         let distance = targetElemPosition - scrollTop;
                                //         scrollTop = scrollTop + distance / 5;
                                //         if (Math.abs(distance) < 1) {
                                //             _body.scrollTo(0, targetElemPosition);
                                //         } else {
                                //             _body.scrollTo(0, scrollTop);
                                //             setTimeout(step, 20);
                                //         }
                                //     };
                                //     step();
                                // } else {
                                //     _body.scrollTo({
                                //         top: targetElemPosition,
                                //         behavior: "smooth"
                                //     });
                                // }

                            _body.scrollTo({
                                top: q(`#M${y}${_monthStr}`).offsetTop - _body.offsetTop,
                                behavior: "smooth"
                            });
                        }, false);
                    });

                    let posArr = [], _pos;
                    initScroll();
                    function initScroll() {
                        tits.forEach(function (item) {
                            posArr.push(item.offsetTop - _body.offsetTop - document.documentElement.clientWidth / 750 * 40 * .75);
                        });
                        posArr.push(document.body.clientHeight * 100);
                        posArr[0] = -document.body.clientHeight * 100;
                        _pos = 0;
                        _body.addEventListener("scroll", scrollFunction, false);
                    }
                    function scrollFunction() {
                        let top = this.scrollTop;
                        let idx = inArea(posArr, top);
                        if (_pos !== idx) {
                            _pos = idx;
                            scrollToTarget(idx);
                        } else {
                            resetYearBtn();
                            if (~~targetIndex === idx) {
                                changeTitLock = false;
                            }
                        }
                    }
                    function scrollToTarget(idx) {
                        let list = months;
                        if (list && list.length > 0) {
                            list.forEach(function (item, index) {
                                if (!changeTitLock) {
                                    if (idx === index) {
                                        item.ca("gde-month-cur");
                                        q(".gde-head-month").scrollTo({
                                            left: item.offsetLeft,
                                            behavior: "smooth"
                                        });
                                    } else {
                                        item.cm("gde-month-cur")
                                    }
                                }
                            });
                        }
                    }

                    function inArea(arr, num){for(let i = 0; i < arr.length; i++){if(arr[i] > num){return i - 1;}}}
                }

                q("#gdeReset").addEventListener('click', function () {
                    _self.clear();
                }, false);

                const close = q(".gde-close");
                close.addEventListener('click', function () {
                    _self.close();
                }, false);

                let gds = qa(".gde-mdd");
                if (gds && gds.length > 0) {
                    for (let i=0;i<gds.length;i++) {
                        if (!gds[i].cc("gde-out")) {
                            gds[i].addEventListener("click", function () {
                                let {y, m, d} = this.dataset;
                                if (_self.clickTag === 0) {
                                    _self.clear();
                                    this.ca(START_CLASS);
                                    _self.selectedArray.push({
                                        date: new Date(~~y, ~~m, ~~d).getTime(),
                                        isStart: true
                                    });
                                    q("#startDateMirror").innerText = ymdToStr(y, m, d);
                                    gdeNext.ca("gde-disabled");
                                    gdeNext.innerText = END_STRING;
                                    _self.clickTag = 1;
                                } else if (_self.clickTag === 1) {
                                    let _date = new Date(~~y, ~~m, ~~d);
                                    let _dateTime = _date.getTime();
                                    if (_dateTime < _self.selectedArray[0].date) {
                                        _self.clear();
                                        this.ca(START_CLASS);
                                        _self.selectedArray.push({
                                            date: new Date(~~y, ~~m, ~~d).getTime(),
                                            isStart: true
                                        });
                                        q("#startDateMirror").innerText = ymdToStr(y, m, d);
                                    } else if (_dateTime > _self.selectedArray[0].date) {
                                        let _days = dayToArray(dateToStr(new Date(_self.selectedArray[0].date)), ymdToStr(y, m, d));
                                        if (_days && _days.length > 0) {
                                            _days.forEach(function (item) {
                                                let el = q(`#D${dateToStr(new Date(item.date), true)}`);
                                                if (item.isStart) { el.ca(START_CLASS) }
                                                if (item.isCenter) { el.ca(CENTER_CLASS) }
                                                if (item.isEnd) { el.ca(END_CLASS) }
                                            });
                                            let _startStr = dateToStr(new Date(_days[0].date));
                                            let _endStr = ymdToStr(y, m, d);
                                            q("#endDateMirror").innerText = _endStr;
                                            q("#totalDaysMirror").innerText = `共${_days.length - 1}晚`;

                                            gdeNext.addEventListener("click", function () {
                                                _self.startInput && (_self.startInput.value = _startStr);
                                                _self.endInput && (_self.endInput.value = _endStr);
                                                _self.startValue = _startStr;
                                                _self.endValue = _endStr;
                                                _self.selectedArray = _days;
                                                _self.totalDaysEl && (_self.totalDaysEl.innerText = `共${_days.length - 1}晚`);
                                                _self.close();
                                            }, false);
                                            _self.clickTag = 0;
                                        }
                                        gdeNext.cm("gde-disabled");
                                        gdeNext.innerText = "完成";
                                    }
                                }
                            }, false);

                        }
                    }
                }

                prevYear.addEventListener('click', function () {
                    if (!this.cc(DISABLED_CLASS)) {
                        let _curY = q(".gde-month-cur");
                        let _yearPref = q(`#M${(_curY ? ~~_curY.dataset.y : currentYear) - 1}01`);
                        if (_yearPref) {
                            _body.scrollTo({top: _yearPref.offsetTop - _body.offsetTop, behavior: "smooth"})
                        } else {
                            _body.scrollTo({top: 0, behavior: "smooth"})
                        }
                    }
                }, false);
                nextYear.addEventListener('click', function () {
                    if (!this.cc(DISABLED_CLASS)) {
                        let _curY = q(".gde-month-cur");
                        let _yearNext = q(`#M${(_curY ? ~~_curY.dataset.y : currentYear) + 1}01`);
                        if (_yearNext) {
                            _body.scrollTo({top: _yearNext.offsetTop - _body.offsetTop, behavior: "smooth"})
                        }
                    }
                }, false);

                function resetYearBtn() {
                    let curMonth = q(".gde-month-cur");
                    if (curMonth) {
                        let {y} = curMonth.dataset;
                        if (y <= currentYear) {
                            prevYear.ca(DISABLED_CLASS);
                        } else {
                            prevYear.cm(DISABLED_CLASS);
                        }
                        let _nextY = q(`#M${~~y + 1}01`);
                        if (_nextY) {
                            nextYear.cm(DISABLED_CLASS);
                        } else {
                            nextYear.ca(DISABLED_CLASS);
                        }
                        let _yn = q(".gde-head-yn");
                        if (_yn) { _yn.innerText = `${y}年` }
                    }
                }


            }


            _self.trigger.addEventListener('click', popupArea, false);
        },

        close: function () {
            let _self = this;
            let evt = new CustomEvent('input');
            this.startInput && this.startInput.dispatchEvent(evt);
            let wrap = q(".gde");
            wrap.cm("slideIn");
            wrap.ca("slideOut");
            this.unlockBg();
            wrap.querySelector(".gde-main").addEventListener('webkitAnimationEnd', function (e) {
                if (e.animationName === "slideOut") {
                    wrap.remove();
                    _self.gearArea = null;
                }
            })
        },
        clear: function () {
            let _self = this;
            let starts = qa(`.${START_CLASS}`);
            let centers = qa(`.${CENTER_CLASS}`);
            let ends = qa(`.${END_CLASS}`);
            let startDateMirror = q(`#startDateMirror`);
            let endDateMirror = q(`#endDateMirror`);
            let totalDaysMirror = q("#totalDaysMirror")
            let gdeNext = q("#gdeNext");
            if (starts && starts.length > 0) {
                starts.forEach(function (item) {
                    item.cm(START_CLASS);
                })
            }
            if (centers && centers.length > 0) {
                centers.forEach(function (item) {
                    item.cm(CENTER_CLASS)
                })
            }
            if (ends && ends.length > 0) {
                ends.forEach(function (item) {
                    item.cm(END_CLASS)
                })
            }
            if (startDateMirror) { startDateMirror.innerText = DATE_STRING }
            if (endDateMirror) { endDateMirror.innerText = DATE_STRING }
            if (totalDaysMirror) { totalDaysMirror.innerText = '-' }
            if (gdeNext) {
                gdeNext.innerText = START_STRING;
                gdeNext.ca("gde-disabled")
            }
            this.startInput && (this.startInput.value = "");
            this.endInput && (this.endInput.value = "");
            this.startValue = "";
            this.endValue = "";
            this.totalDaysEl && (this.totalDaysEl.innerText = "-");
            this.selectedArray.length = 0;
        },
        lockBg: function () {
            let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            this.scrollTop = scrollTop;
            let body = document.body;
            let style = body.style;
            style.position = "fixed";
            style.top = -scrollTop + "px";
            style.left = "0";
            style.right = "0";
            style.bottom = "0";
            body.dataset.st = scrollTop.toString();
        },
        unlockBg: function (scrollTop) {
            document.body.style.position = "static";
            window.scroll(0, scrollTop ? scrollTop : document.body.dataset.st);
        }
    }

    return GearDate;
})()