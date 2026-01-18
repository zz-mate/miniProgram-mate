import {playBtnAudio} from '../../utils/audioUtil'
Component({
  properties: {
    spot: {
      type: Array,
      value: []
    },
    dailyList: {
      type: Array,
      value: []
    },
    defaultTime: {
      type: String,
      value: ''
    },
    cal_title: {
      type: String,
      value: ''
    },
    spots: {
      type: Array,
      value: []
    },
		dailyType:{
			type:String,
			value:""
		},
    theme_color: {
      type: String,
      value: '#FFD608'
    }
  },

  data: {
    dateList: [], 
    selectDay: {}, 
    open: true, 
    color1: '', 
    color2: ''  
  },

  methods: {
    // 颜色转换（保留）
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // 时间格式化（保留）
    formatTime(time, format) {
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }

      function getDate(time, format) {
        const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
        const returnArr = []
        const date = new Date(time)
        returnArr.push(date.getFullYear())
        returnArr.push(formatNumber(date.getMonth() + 1))
        returnArr.push(formatNumber(date.getDate()))
        returnArr.push(formatNumber(date.getHours()))
        returnArr.push(formatNumber(date.getMinutes()))
        returnArr.push(formatNumber(date.getSeconds()))
        for (const i in returnArr) {
          format = format.replace(formateArr[i], returnArr[i])
        }
        return format
      }

      function getDateDiff(time) {
        let r = ''
        const ft = new Date(time)
        const nt = new Date()
        const nd = new Date(nt)
        nd.setHours(23)
        nd.setMinutes(59)
        nd.setSeconds(59)
        nd.setMilliseconds(999)
        const d = parseInt((nd - ft) / 86400000)
        switch (true) {
          case d === 0:
            const t = parseInt(nt / 1000) - parseInt(ft / 1000)
            switch (true) {
              case t < 60:
                r = '刚刚'
                break
              case t < 3600:
                r = parseInt(t / 60) + '分钟前'
                break
              default:
                r = parseInt(t / 3600) + '小时前'
            }
            break
          case d === 1:
            r = '昨天'
            break
          case d === 2:
            r = '前天'
            break
          case d > 2 && d < 30:
            r = d + '天前'
            break
          default:
            r = getDate(time, 'Y-M-D')
        }
        return r
      }
      if (!format) {
        return getDateDiff(time)
      } else {
        return getDate(time, format)
      }
    },

    // picker设置月份（保留）
    editMonth(e) {
      const arr = e.detail.value.split("-")
      const year = parseInt(arr[0])
      const month = parseInt(arr[1])
      // 手动操作：开启事件触发
      this.setMonth(year, month, undefined, true)
    },

    // 上月切换按钮点击（保留）
    lastMonth() {
			// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			// wx.vibrateShort({ type: 'light' })
      const lastMonth = new Date(this.data.selectDay.year, this.data.selectDay.month - 2)
      const year = lastMonth.getFullYear()
      const month = lastMonth.getMonth() + 1
      // 手动操作：开启事件触发
      this.setMonth(year, month, undefined, true)
    },

    // 下月切换按钮点击（保留）
    nextMonth() {
			// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			// wx.vibrateShort({ type: 'light' })
      const nextMonth = new Date(this.data.selectDay.year, this.data.selectDay.month)
      const year = nextMonth.getFullYear()
      const month = nextMonth.getMonth() + 1
      // 手动操作：开启事件触发
      this.setMonth(year, month, undefined, true)
    },

    // 核心修改：增加triggerEvent开关参数（默认false）
    setMonth(setYear, setMonth, setDay, triggerEvent = false) {
      if (this.data.selectDay.year !== setYear || this.data.selectDay.month !== setMonth) {
        const day = Math.min(new Date(setYear, setMonth, 0).getDate(), this.data.selectDay.day)
        const time = new Date(setYear, setMonth - 1, setDay ? setDay : day)
        const data = {
          selectDay: {
            year: setYear,
            month: setMonth,
            day: setDay ? setDay : day,
            dateString: this.formatTime(time, "Y-M-D")
          }
        }
        if (!setDay) {
          data.open = true
        }
        this.setData(data)
        this.dateInit(setYear, setMonth)
        // 关键：只有triggerEvent为true时才触发change事件
        if (triggerEvent) {
          this.triggerEvent("change", this.data.selectDay)
        }
      }
    },

    // 展开收起（保留）
    openChange() {
      this.setData({
        open: !this.data.open
      })
      this.triggerEvent("aaa", { a: 0 })
      this.dateInit()
    },

    // 匹配dailyList金额数据（保留）
    matchDailyAmount(dateList) {
      const { dailyList } = this.properties;
      if (!dailyList.length) return dateList;

      return dateList.map(item => {
        const itemDay = item.day.toString().padStart(2, '0');
				const itemMonth = item.month.toString().padStart(2, '0');
        const dailyItem = dailyList.find(d => d.day === itemDay&&d.month==itemMonth);
        
        return {
          ...item,
          income: dailyItem?.income || "0.00",
          expense: dailyItem?.expense || "0.00",
          hasAmount: (dailyItem?.income && dailyItem.income !== "0.00") || (dailyItem?.expense && dailyItem.expense !== "0.00")
        };
      });
    },

    // 设置日历底下小圆点（保留）
    setSpot() {
      if (!this.data.dateList.length) return;

      const spotTimeArr = this.data.spot.map(item => this.formatTime(item, "Y-M-D"));
      const listTimeArr = this.properties.list.map(item => {
        if (item.dateString) return item.dateString;
        if (item.year && item.month && item.day) {
          return `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        }
        return this.formatTime(item, "Y-M-D");
      });
      const allSpotDates = [...new Set([...spotTimeArr, ...listTimeArr])];

      const newDateList = this.data.dateList.map(item => ({
        ...item,
        spot: allSpotDates.includes(item.dateString) || item.hasAmount
      }));

      this.setData({ dateList: newDateList });
    },

    // 日历主体渲染（保留）
    dateInit(setYear = this.data.selectDay.year, setMonth = this.data.selectDay.month) {
      let dateList = [];
      let now = new Date(setYear, setMonth - 1) 
      let startWeek = now.getDay(); 
      let dayNum = new Date(setYear, setMonth, 0).getDate() 
      let forNum = Math.ceil((startWeek + dayNum) / 7) * 7 

      if (this.data.open) {
        for (let i = 0; i < forNum; i++) {
          const now2 = new Date(now)
          now2.setDate(i - startWeek + 1)
          dateList.push({
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, "Y-M-D")
          });
        }
      } else {
        for (let i = 0; i < 7; i++) {
          const now2 = new Date(now)
          now2.setDate(Math.ceil((this.data.selectDay.day + startWeek) / 7) * 7 - 6 - startWeek + i)
          dateList.push({
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, "Y-M-D")
          });
        }
      }

      const dateListWithAmount = this.matchDailyAmount(dateList);
      this.setData({ dateList: dateListWithAmount }, () => {
        // this.setSpot();
      });
    },

    // 日期点击事件（核心修改：手动触发事件）
    selectChange(e) {
      const { year, month, day, dateString } = e.currentTarget.dataset;
      const currentDateItem = this.data.dateList.find(item => 
        item.year === parseInt(year) && 
        item.month === parseInt(month) && 
        item.day === parseInt(day)
      );	
      const selectDay = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        dateString,
        income: currentDateItem?.income || "0.00",
        expense: currentDateItem?.expense || "0.00"
      };

      if (this.data.selectDay.year !== selectDay.year || this.data.selectDay.month !== selectDay.month) {
        // 日期跨月：调用setMonth并开启事件触发
        this.setMonth(selectDay.year, selectDay.month, selectDay.day, true);
      } else if (this.data.selectDay.day !== selectDay.day) {
        this.setData({ selectDay });
        // 日期同月份：直接触发change事件
        this.triggerEvent("change", selectDay);
      }
    }
  },

  lifetimes: {
    attached() {
      // 初始化默认时间
      let now = this.data.defaultTime ? new Date(this.data.defaultTime) : new Date()
      let selectDay = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        dateString: this.formatTime(now, "Y-M-D")
      }
      // 核心：初始化调用setMonth时，关闭事件触发（最后一个参数为false，默认值）
      this.setMonth(selectDay.year, selectDay.month, selectDay.day);

      // 初始化主题色（保留）
      let color = this.hexToRgb(this.data.theme_color)
      if (color) {
        this.setData({
          color1: `rgba(${color.r},${color.g},${color.b},0.3)`,
          color2: `rgba(${color.r},${color.g},${color.b},1)`
        })
      }
    }
  },

  // 监听数据变化（保留）
  observers: {
    'dailyList': function (newDailyList) {
      this.dateInit();
    },
    'list': function (newList) {
      // this.setSpot();
    },
    'spot': function (newSpot) {
      this.setSpot();
    }
  }
})