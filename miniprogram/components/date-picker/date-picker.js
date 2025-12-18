// DatePicker/DatePicker.js
const dateUtil = require('../../utils/dateutils');
const {
  compareVersion
} = require('../../utils/common');
const defaultStartYear = 1970;
const defaultEndYear = new Date().getFullYear() + 100;
let years = []
let months = []
let days = []
let hours = []
let minutes = []
let seconds = []
for (let i = defaultStartYear; i <= defaultEndYear; i++) {
  years.push(i);
}
for (let i = 1; i <= 12; i++) {
  months.push(i);
}
let defaultYear = new Date().getFullYear();
let defaultMonth = new Date().getMonth() + 1;
let defaultDayCount = dateUtil.getDaysOfMonth(defaultYear, defaultMonth);
for (let i = 1; i <= defaultDayCount; i++) {
  days.push(i);
}
for (let i = 0; i < 24; i++) {
  hours.push(i);
}
for (let i = 0; i < 60; i++) {
  minutes.push(i);
}
for (let i = 0; i < 60; i++) {
  seconds.push(i);
}

let beforeYear;
let beforeMonth;
let resultValue;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    date: {
      type: Number,
      value: new Date().getTime(),
      observer: function (newVal, oldVal, changedPath) {
				console.log('传递值--------->',newVal)
        this.setDateByMode();
      }
    },
    mode: {
      type: String,
      value: 'YMD',
      observer: function () {
        this.setDateByMode();
      }
    },
    visible: {
      type: Boolean,
      value: false
    },
    minScale: { // 分钟精度
      type: Number,
      value: 1,
      observer: function (newVal) {
        let newMinutes = []
        for (let i = 0; i < 60; i += newVal) {
          newMinutes.push(i);
        }
        minutes = newMinutes;
        this.setData({
          minutes: newMinutes
        })
      }
    },
    startDate: {
      type: String,
      value: '',
    },
    endDate: {
      type: String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    cMode: "",
    years: years,
    months: months,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    value: [],
    startDateLimit: [],
    endDateLimit: [],

    isShowYear: false,
    isShowMonth: false,
    isShowDay: false,
    isShowHour: false,
    isShoMinutes: false,
    isShowSeconds: false,

    isSupport: true, // 当前系统基础库版本是否支持immediate-change属性
    scrolling: false, // 不支持时滚动处理
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created() {
      this.setDateByMode();
    },
    attached() {
      this.setDateByMode();
      this.defaultDateLimit();
      wx.getSystemInfo({
        success: (res) => {
          // immediate-change属性：基础库版不低于2.21.1
          const isSupport = compareVersion(res.SDKVersion, '2.21.1') >= 0;
          this.setData({
            isSupport
          });
        }
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    defaultDateLimit() {
      const {
        startDate,
        endDate
      } = this.data;
      const startDateLimit = startDate ? startDate.split('-') : [];
      const endDateLimit = endDate ? endDate.split('-') : [];
      // 处理年
      let beginYear = startDateLimit[0] / 1 || defaultStartYear;
      let overYear = endDateLimit[0] / 1 || defaultEndYear;
      let newYears = []
      for (let i = beginYear; i <= overYear; i++) {
        newYears.push(i);
      }
      this.setData({
        years: newYears,
        startDateLimit,
        endDateLimit
      })
    },

    setDateByMode() {
      const newDate = this.data.date || new Date().getTime();
			
			console.log('休闲鞋---->', newDate)
      let year = dateUtil.getYear(newDate);
      let month = dateUtil.getMonth(newDate);
			console.log('年月----->' ,year,"year",month,'month')
      this.setMonths(year);
      this.setDays(year, month);
      const startDate = this.data.startDate;
      const startDateLimit = startDate ? startDate.split('-') : [];
      let days = dateUtil.getDay(newDate);
      let hours = dateUtil.getHour(newDate);
      let minutes = dateUtil.getMinute(newDate, this.data.minScale);
      let seconds = dateUtil.getSecond(newDate);
      beforeYear = year;
      beforeMonth = month;
      // 处理月
      let monthIndex = 0;
        monthIndex = month - 1;
  
      // 处理日
      let daysIndex = 0;
      if(year == startDateLimit[0] && month == startDateLimit[1] ) {
        daysIndex = days - (startDateLimit[2] ? Number(startDateLimit[2]) : 0)
      } else {
        daysIndex = days - 1
      }

      let newValue = [year -  defaultStartYear, monthIndex, daysIndex, hours, minutes, seconds]

      this.setData({
        value: newValue.map(i => (i >= 0 ? i : 0)),
      })
			console.log(this.data.value,'<------数组')
      resultValue = this.data.value;
      this.setColumns();
    },
    setColumns() {
      let mode = this.data.mode;
      this.setData({
        isShowYear: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'YMD' || mode=='Y',
        isShowMonth: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'YMD' || mode == 'MD',
        isShowDay: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'YMD' || mode == 'MD',
        isShowHour: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'hm',
        isShoMinutes: mode == 'YMDhms' || mode == 'YMDhm' || mode == 'hm',
        isShowSeconds: mode == 'YMDhms',
      })
    },
    setDays(year, month) {
      if (year != beforeYear || beforeMonth != month) {
        beforeYear = year;
        beforeMonth = month;
        const {
          startDateLimit,
          endDateLimit
        } = this.data;
        let dayCount = dateUtil.getDaysOfMonth(year, month);
        let days = [];
        // 年==限制开始年并且月==限制开始月
        if (year <= startDateLimit[0] && month <= Number(startDateLimit[1])) {
          days = this.generateArray(Number(startDateLimit[2]), dayCount);
        } else if (year >= endDateLimit[0] && month >= Number(endDateLimit[1])) {
          // 年==限制结束年并且月==限制结束月
          days = this.generateArray(1, Math.min(Number(endDateLimit[2]), dayCount));
        } else {
          // 其他
          days = this.generateArray(1, dayCount);
        }
        this.setData({
          days: days,
        })
      }
    },
    // 获取指定范围连续数字数组
    generateArray(startNum, endNum) {
      let arr = [];
      for (let i = startNum; i <= endNum; i++) {
        arr.push(i);
      }
      return arr;
    },
    setMonths(year) {
      const {
        startDateLimit,
        endDateLimit
      } = this.data;
      let newMonth = [];
      if (year == startDateLimit[0]) {
        newMonth = this.generateArray(Number(startDateLimit[1]), 12);
      } else if (year == endDateLimit[0]) {
        newMonth = this.generateArray(1, Number(endDateLimit[1]));
      } else {
        newMonth = this.generateArray(1, 12);
      }
      this.setData({
        months: newMonth
      })
    },
    bindChange: function (e) {
      const val = e.detail.value
      resultValue = val.map(i => (i >= 0 ? i : 0));
      let year = this.data.years[val[0]] || this.data.years[this.data.years.length - 1];
      this.setMonths(year);
      let month = this.data.months[val[1]] || this.data.months[this.data.months.length - 1];
      this.setDays(year, month);



      const myEventDetail = {};
      myEventDetail.date = this.getResultDate();
      this.triggerEvent('onConfirm', myEventDetail)
    },
    onCancellClick() {
      this.triggerEvent('onCancel')
    },
    onOkClick() {
      const {
        scrolling
      } = this.data;
      if (!scrolling) {
        const myEventDetail = {};
        myEventDetail.date = this.getResultDate();
        this.triggerEvent('onConfirm', myEventDetail)
      } else {
        wx.showToast({
          title: '请确保滑动稳定后再次确定',
          mask: true,
          icon: 'none'
        })
      }
    },
    getResultDate() {
      let result = 0;
      let year = this.data.years[resultValue[0]];
      let month = resultValue[1] >= 0 ? this.data.months[resultValue[1]] : this.data.months[this.data.months.length - 1];
      let day = this.data.days[resultValue[2]] || this.data.days[this.data.days.length - 1];
      let hour = this.data.hours[resultValue[3]] || 0;
      let minutes = this.data.minutes[resultValue[4]] || 0;
      let seconds = this.data.seconds[resultValue[5]] || 0;
      result = new Date(`${year}/${month}/${day} ${hour}:${minutes}:${seconds}`).getTime();
      return result;
    },
    // 基础库版本不支持immediate-change属性时，利用滑动时提示避免出错率
    bindpickstart() {
      const {
        isSupport
      } = this.data;
      !isSupport && this.setData({
        scrolling: true
      })
    },
    // 基础库版本不支持immediate-change属性时，利用滑动时提示避免出错率
    bindpickend() {
      const {
        isSupport
      } = this.data;
      !isSupport && this.setData({
        scrolling: false
      })
    },
  }
})
