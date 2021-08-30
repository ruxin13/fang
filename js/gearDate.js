window.GearDate = (function () {
    let GearDate = function () {
        this.scrollTop = 0;
        this.selectedArray = [];
        this.startValue = "";
        this.endValue = "";
        this.clickTag = 0;
        this.q = function (selector) { return document.querySelector(selector) };
        this.qa = function (selector) { return document.querySelectorAll(selector) };
        Element.prototype.ca = function (cls) { return cls ? this.classList.add(cls) : false };
        Element.prototype.cm = function (cls) { return cls ? this.classList.remove(cls) : false };
        Element.prototype.cc = function (cls) { return cls ? this.classList.contains(cls) : false };
    }
    GearDate.prototype = {
        init: function (params) {
            this.params = params;
            this.startClass = "gde-sel-start";
            this.centerClass = "gde-sel-center";
            this.endClass = "gde-sel-end";
            this.hdClass = "gde-head-disabled";
            this.startString = "请选择入住日期";
            this.endString = "请选择退房日期";
            this.dateString = "请选择日期";
            this.startInput = this.q(params.startInput);
            this.endInput = this.q(params.endInput);
            this.totalDaysEl = this.q(params.totalDays);
            this.trigger = this.q(params.trigger);
            this.totalMonth = params.totalMonth || 12;
            if (this.startValue && this.endValue) {
                if (this.startInput.value && this.endInput.value) {
                    this.startValue = this.startInput.value;
                    this.endValue = this.endInput.value;
                    this.selectedArray = this.dayToArray(this.startValue, this.endValue);
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
                        data-m="${month % 12}" data-index="${i}">${_self.translateMonth(month % 12)}月</div>`;
                }
                for (let m=0;m<7;m++) {
                    dayHeadHtml += `<div class="gde-head-d ${m === 0 || m === 6 ? 'gde-weekend' : ''}">${_self.translateDay(m)}</div>`
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
                    if (_self.isLeapYear(_year)) { daysInMonth[1] = 29 }
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
                                            otherClass = _self.startClass;
                                        } else if (_self.selectedArray[k].isCenter) {
                                            otherClass = _self.centerClass;
                                        } else if (_self.selectedArray[k].isEnd) {
                                            otherClass = _self.endClass;
                                        }
                                    }
                                }
                            }
                        }
                        let _dateStr = _self.ymdToStr(_year, _month, j + 1, true);
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
                                    <div class="gde-ret-b" id="startDateMirror">${ _self.startInput ? (_self.startInput.value ? _self.startInput.value : _self.dateString) : ''}</div>
                                </div>
                                <div class="gde-ret-c" id="totalDaysMirror">${_self.totalDaysEl ? (_self.totalDaysEl.innerText ? _self.totalDaysEl.innerText.replace(/^\d/, "") : "-") : ""}</div>
                                <div class="gde-ret-r">
                                    <div class="gde-ret-t">离开时间</div>
                                    <div class="gde-ret-b" id="endDateMirror">${_self.endInput ? (_self.endInput.value ? _self.endInput.value : _self.dateString) : ''}</div>
                                </div>
                            </div>
                            <div class="gde-head-year">
                                <img class="gde-head-yl ${_self.hdClass}" id="prevYear" src="img/icon_arrow_down.png" alt />
                                <div class="gde-head-yn">${currentYear}年</div>
                                <img class="gde-head-yr" id="nextYear" src="img/icon_arrow_down.png" alt />
                            </div>
                            <div class="gde-head-month">${monthHeadHtml}</div>
                            <div class="gde-head-day">${dayHeadHtml}</div>
                            <div class="gde-body">${monthHtml}</div>
                            <div class="gde-btn-confirm gde-disabled" id="gdeNext">${_self.startString}</div>
                        </div>`;
                document.body.appendChild(_self.gearArea);
                _self.q(".gde").ca("slideIn");
                const _body = _self.q(".gde-body");
                const gdeNext = _self.q("#gdeNext");
                let yearShow = _self.q(".gde-head-yn");
                let prevYear = _self.q("#prevYear");
                let nextYear = _self.q("#nextYear");
                if (_self.startValue && _self.endValue) {
                    let _startYear = ~~_self.startValue.split("-")[0];
                    let startValueArr = _self.startValue.split("-");
                    let targetMonthHead = _self.q(`#M${startValueArr[0]}${startValueArr[1]}`);
                    if (targetMonthHead) { _body.scrollTo(0, targetMonthHead.offsetTop - _body.offsetTop) }
                    if (yearShow) { yearShow.innerText = `${_startYear}年` }
                    if (_startYear > currentYear) { prevYear.cm(_self.hdClass) }
                    let _nextFY = ~~_self.endValue.split("-")[0];
                    let _nextFYEl = _self.q(`#M${_nextFY + 1}01`);
                    if (_nextFY && _nextFYEl) {
                        nextYear.cm(_self.hdClass)
                    } else {
                        nextYear.ca(_self.hdClass)
                    }
                    gdeNext.cm("gde-disabled");
                    gdeNext.innerText = "完成";
                    gdeNext.addEventListener("click", function () {
                        if (!this.cc("gde-disabled")) {
                            _self.startInput && (_self.startInput.value = _self.startValue);
                            _self.endInput && (_self.endInput.value = _self.endValue);
                            _self.selectedArray = _self.dayToArray(_self.startValue, _self.endValue);
                            _self.close();
                        }
                    }, false);
                }

                let months = _self.qa(".gde-head-mon");
                let tits = _self.qa(".gde-head-ym");
                if (months && months.length > 0) {
                    let changeTitLock = false, targetIndex = 0;
                    months.forEach(function (item) {
                        item.addEventListener("click", function () {
                            changeTitLock = true;
                            let {y, m} = item.dataset;
                            targetIndex = item.dataset.index;
                            let selected = _self.qa(".gde-month-cur");
                            if (selected && selected.length > 0) {
                                selected.forEach(function (item2) {
                                    item2.cm("gde-month-cur");
                                });
                            }
                            item.ca("gde-month-cur");
                            let _monthStr = ~~m + 1;
                            if (_monthStr < 10) { _monthStr = `0${_monthStr}` }

                            // ios的平滑滚动，因为有小bug,所以暂时不放出来
                                // let targetElemPosition = _self.q(`#M${y}${_monthStr}`).offsetTop - _body.offsetTop
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
                                top: _self.q(`#M${y}${_monthStr}`).offsetTop - _body.offsetTop,
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
                                        _self.q(".gde-head-month").scrollTo({
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

                _self.q("#gdeReset").addEventListener('click', function () {
                    _self.clear();
                }, false);

                const close = _self.q(".gde-close");
                close.addEventListener('click', function () {
                    _self.close();
                }, false);

                let gds = _self.qa(".gde-mdd");
                if (gds && gds.length > 0) {
                    for (let i=0;i<gds.length;i++) {
                        if (!gds[i].cc("gde-out")) {
                            gds[i].addEventListener("click", function () {
                                let {y, m, d} = this.dataset;
                                if (_self.clickTag === 0) {
                                    _self.clear();
                                    this.ca(_self.startClass);
                                    _self.selectedArray.push({
                                        date: new Date(~~y, ~~m, ~~d).getTime(),
                                        isStart: true
                                    });
                                    _self.q("#startDateMirror").innerText = _self.ymdToStr(y, m, d);
                                    gdeNext.ca("gde-disabled");
                                    gdeNext.innerText = _self.endString;
                                    _self.clickTag = 1;
                                } else if (_self.clickTag === 1) {
                                    let _date = new Date(~~y, ~~m, ~~d);
                                    let _dateTime = _date.getTime();
                                    if (_dateTime < _self.selectedArray[0].date) {
                                        _self.clear();
                                        this.ca(_self.startClass);
                                        _self.selectedArray.push({
                                            date: new Date(~~y, ~~m, ~~d).getTime(),
                                            isStart: true
                                        });
                                        _self.q("#startDateMirror").innerText = _self.ymdToStr(y, m, d);
                                    } else if (_dateTime > _self.selectedArray[0].date) {
                                        let _days = _self.dayToArray(_self.dateToStr(new Date(_self.selectedArray[0].date)), _self.ymdToStr(y, m, d));
                                        if (_days && _days.length > 0) {
                                            _days.forEach(function (item) {
                                                let el = _self.q(`#D${_self.dateToStr(new Date(item.date), true)}`);
                                                if (item.isStart) { el.ca(_self.startClass) }
                                                if (item.isCenter) { el.ca(_self.centerClass) }
                                                if (item.isEnd) { el.ca(_self.endClass) }
                                            });
                                            let _startStr = _self.dateToStr(new Date(_days[0].date));
                                            let _endStr = _self.ymdToStr(y, m, d);
                                            _self.q("#endDateMirror").innerText = _endStr;
                                            _self.q("#totalDaysMirror").innerText = `共${_days.length - 1}晚`;

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
                    if (!this.cc(_self.hdClass)) {
                        let _curY = _self.q(".gde-month-cur");
                        let _yearPref = _self.q(`#M${(_curY ? ~~_curY.dataset.y : currentYear) - 1}01`);
                        if (_yearPref) {
                            _body.scrollTo({top: _yearPref.offsetTop - _body.offsetTop, behavior: "smooth"})
                        } else {
                            _body.scrollTo({top: 0, behavior: "smooth"})
                        }
                    }
                }, false);
                nextYear.addEventListener('click', function () {
                    if (!this.cc(_self.hdClass)) {
                        let _curY = _self.q(".gde-month-cur");
                        let _yearNext = _self.q(`#M${(_curY ? ~~_curY.dataset.y : currentYear) + 1}01`);
                        if (_yearNext) {
                            _body.scrollTo({top: _yearNext.offsetTop - _body.offsetTop, behavior: "smooth"})
                        }
                    }
                }, false);

                function resetYearBtn() {
                    let curMonth = _self.q(".gde-month-cur");
                    if (curMonth) {
                        let {y} = curMonth.dataset;
                        if (y <= currentYear) {
                            prevYear.ca(_self.hdClass);
                        } else {
                            prevYear.cm(_self.hdClass);
                        }
                        let _nextY = _self.q(`#M${~~y + 1}01`);
                        if (_nextY) {
                            nextYear.cm(_self.hdClass);
                        } else {
                            nextYear.ca(_self.hdClass);
                        }
                        let _yn = _self.q(".gde-head-yn");
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
            let wrap = this.q(".gde");
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
            let starts = this.qa(`.${_self.startClass}`);
            let centers = this.qa(`.${_self.centerClass}`);
            let ends = this.qa(`.${_self.endClass}`);
            let startDateMirror = this.q(`#startDateMirror`);
            let endDateMirror = this.q(`#endDateMirror`);
            let totalDaysMirror = this.q("#totalDaysMirror")
            let gdeNext = this.q("#gdeNext");
            if (starts && starts.length > 0) {
                starts.forEach(function (item) {
                    item.cm(_self.startClass);
                })
            }
            if (centers && centers.length > 0) {
                centers.forEach(function (item) {
                    item.cm(_self.centerClass)
                })
            }
            if (ends && ends.length > 0) {
                ends.forEach(function (item) {
                    item.cm(_self.endClass)
                })
            }
            if (startDateMirror) { startDateMirror.innerText = this.dateString }
            if (endDateMirror) { endDateMirror.innerText = this.dateString }
            if (totalDaysMirror) { totalDaysMirror.innerText = '-' }
            if (gdeNext) {
                gdeNext.innerText = this.startString;
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
        },
        translateMonth: function (month) {
            month = ~~month;
            return ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][month]
        },
        translateDay: function (day) {
            day = ~~day;
            return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][day]
        },
        isLeapYear: function (year) {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
        },
        dayToArray: function (startDate, endDate) {
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
        },
        dateToStr: function (date, noGap) {
            if (date instanceof Date) {
                return this.ymdToStr(date.getFullYear(), date.getMonth(), date.getDate(), noGap);
            } else {
                return ""
            }
        },
        ymdToStr: function (y, m, d, noGap) {
            m = ~~m + 1;
            if (m < 10) { m = `0${m}` }
            if (d < 10) { d = `0${d}` }
            if (noGap) {
                return `${y}${m}${d}`
            } else {
                return `${y}-${m}-${d}`
            }
        },

    }
    return GearDate;
})()