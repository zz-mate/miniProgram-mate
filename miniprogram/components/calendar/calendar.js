Component({
  properties: {
    spot: {
      type: Array,
      value: []
    },
    // 新增：接收父组件传递的dailyList数组
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
    theme_color: {
      type: String,
      value: '#FFD608'
    }
  },

  data: {
    dateList: [], //日历主体渲染数组（新增income/expense字段）
    selectDay: {}, //选中时间
    open: true, //展开
    color1: '', // 主题色渐变1
    color2: ''  // 主题色渐变2
  },

  methods: {
    // 颜色转换
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // 时间格式化（保留原有逻辑）
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

    // picker设置月份
    editMonth(e) {
      const arr = e.detail.value.split("-")
      const year = parseInt(arr[0])
      const month = parseInt(arr[1])
      this.setMonth(year, month)
    },

    // 上月切换按钮点击
    lastMonth() {
      wx.vibrateShort({ type: 'heavy' })
      const lastMonth = new Date(this.data.selectDay.year, this.data.selectDay.month - 2)
      const year = lastMonth.getFullYear()
      const month = lastMonth.getMonth() + 1
      this.setMonth(year, month)
    },

    // 下月切换按钮点击
    nextMonth() {
      wx.vibrateShort({ type: 'heavy' })
      const nextMonth = new Date(this.data.selectDay.year, this.data.selectDay.month)
      const year = nextMonth.getFullYear()
      const month = nextMonth.getMonth() + 1
      this.setMonth(year, month)
    },

    // 设置月份
    setMonth(setYear, setMonth, setDay) {
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
        // this.setSpot()
        this.triggerEvent("change",this.data.selectDay )
      }
    },

    // 展开收起
    openChange() {
      this.setData({
        open: !this.data.open
      })
      this.triggerEvent("aaa", { a: 0 })
      this.dateInit()
      // this.setSpot()
    },

    /**
     * 匹配dailyList金额数据到dateList
     * @returns {Array} 带金额的dateList
     */
    matchDailyAmount(dateList) {
      const { dailyList } = this.properties;
      if (!dailyList.length) return dateList;

      // 遍历日历数组，匹配day赋值金额
      return dateList.map(item => {
        // 统一day格式：转为两位数字符串（如 1 → "01"，18 → "18"）
        const itemDay = item.day.toString().padStart(2, '0');
        // 查找dailyList中匹配的day
        const dailyItem = dailyList.find(d => d.day === itemDay);
        
        return {
          ...item,
          // 赋值收入/支出，默认0.00
          income: dailyItem?.income || "0.00",
          expense: dailyItem?.expense || "0.00",
          // 有金额则显示红点（可选）
          hasAmount: (dailyItem?.income && dailyItem.income !== "0.00") || (dailyItem?.expense && dailyItem.expense !== "0.00")
        };
      });
    },

    // 设置日历底下是否展示小圆点（整合金额判断）
    setSpot() {
      if (!this.data.dateList.length) return;

      // 1. 处理原有spot数组
      const spotTimeArr = this.data.spot.map(item => this.formatTime(item, "Y-M-D"));
      // 2. 处理list数组
      const listTimeArr = this.properties.list.map(item => {
        if (item.dateString) return item.dateString;
        if (item.year && item.month && item.day) {
          return `${item.year}-${item.month.toString().padStart(2, '0')}-${item.day.toString().padStart(2, '0')}`;
        }
        return this.formatTime(item, "Y-M-D");
      });
      // 3. 合并红点条件：原有spot + list + 有金额的日期
      const allSpotDates = [...new Set([...spotTimeArr, ...listTimeArr])];

      const newDateList = this.data.dateList.map(item => ({
        ...item,
        // 红点显示条件：匹配spot/list 或 有金额
        spot: allSpotDates.includes(item.dateString) || item.hasAmount
      }));

      this.setData({ dateList: newDateList });
    },

    // 日历主体的渲染方法（核心：调用matchDailyAmount匹配金额）
    dateInit(setYear = this.data.selectDay.year, setMonth = this.data.selectDay.month) {
      let dateList = [];
      let now = new Date(setYear, setMonth - 1) // 当前月份的1号
      let startWeek = now.getDay(); // 目标月1号对应的星期
      let dayNum = new Date(setYear, setMonth, 0).getDate() // 当前月有多少天
      let forNum = Math.ceil((startWeek + dayNum) / 7) * 7 // 当前月跨越的周数

      if (this.data.open) {
        // 展开状态，渲染完整月份
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
        // 非展开状态，只渲染当前周
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

      // 关键：匹配dailyList金额数据
      const dateListWithAmount = this.matchDailyAmount(dateList);
			console.log(dateListWithAmount,123)
      this.setData({ dateList: dateListWithAmount }, () => {
        // this.setSpot(); // 更新红点（包含金额判断）
      });
    },

    // 日期点击事件（可传递金额数据）
    selectChange(e) {
      const { year, month, day, dateString } = e.currentTarget.dataset;
      // 查找当前日期的金额数据
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
        // 携带金额数据到父组件
        income: currentDateItem?.income || "0.00",
        expense: currentDateItem?.expense || "0.00"
      };

      if (this.data.selectDay.year !== selectDay.year || this.data.selectDay.month !== selectDay.month) {
        this.setMonth(selectDay.year, selectDay.month, selectDay.day);
      } else if (this.data.selectDay.day !== selectDay.day) {
        this.setData({ selectDay });
        // 触发事件时携带金额数据
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
      this.setMonth(selectDay.year, selectDay.month, selectDay.day);

      // 初始化主题色
      let color = this.hexToRgb(this.data.theme_color)
      if (color) {
        this.setData({
          color1: `rgba(${color.r},${color.g},${color.b},0.3)`,
          color2: `rgba(${color.r},${color.g},${color.b},1)`
        })
      }
    }
  },

  // 监听数据变化：dailyList/list/spot变化时更新
  observers: {
    'dailyList': function (newDailyList) {
      console.log('监听到dailyList更新：', newDailyList);
      this.dateInit(); // 重新渲染日历并匹配金额
    },
    'list': function (newList) {
      // this.setSpot();
    },
    'spot': function (newSpot) {
      this.setSpot();
    }
  }
})