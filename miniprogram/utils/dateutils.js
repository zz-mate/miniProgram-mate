function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
 */
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
 */
function formatLongTime(longTime, format) {
  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];
  var date = new Date();
  date.setTime(longTime);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));
  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

const getTimeStamp = function () {
  var date = new Date();
  var timestamp = date.getTime();
  return timestamp;
}
//ymd  YYYY-MM-DD
const getTimeStampFromYearMonthDay = function (ymd, spliter) {
  var str = ymd;
  const reg = new RegExp(spliter, "g");
  // 转换日期格式
  str = str.replace(reg, '/'); // "2010/08/01";
  // 创建日期对象
  var date = new Date(str);
  date.setDate(date.getDate());
  var timestamp = date.getTime() - 8 * 60 * 60 * 1000;
  return timestamp;
}

const getCurrentYearMonthDayTimeStamp = function () {
  let cDate = new Date();
  var str = `${cDate.getFullYear()}/${cDate.getMonth()+1}/${cDate.getDate()}`;
  // 创建日期对象
  var date = new Date(str);
  date.setDate(date.getDate());
  var timestamp = date.getTime() - 8 * 60 * 60 * 1000;
  return timestamp;
}


const getYear = function (longTime) {
  var date = new Date();
  date.setTime(longTime);
  const year = date.getFullYear()
  return year
}

const getMonth = function (longTime) {
  var date = new Date();
  date.setTime(longTime);
  const month = date.getMonth() + 1
  return month
}

const getDay = function (longTime) {
  var date = new Date();
  date.setTime(longTime);
  const day = date.getDate()
  return day
}

const getHour = function (longTime) {
  var date = new Date();
  date.setTime(longTime);
  const hour = date.getHours()
  return hour
}

const getMinute = function (longTime, scale = 1) {
  var date = new Date();
  date.setTime(longTime);
  const minute = date.getMinutes();
  if(scale == 1) {
    return minute
  } else {
    if(minute < scale) {
      return 1;
    } else if (minute == parseInt((minute % 100) / scale) * scale || minute >= (60 - scale)) {
      return parseInt((minute % 100) / scale);
    } else {
      return parseInt((minute % 100) / scale) + 1;
    }
  }
}

const getSecond = function (longTime) {
  var date = new Date();
  date.setTime(longTime);
  const second = date.getSeconds()
  return second
}
//month 从1开始
function getDaysOfMonthInYear(year, month) {
  let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if ((year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0)) {
    days[1] = 29
  }

  return days[month - 1];
}
//month 从1开始
function getDaysOfMonth(year, month) {
  let days = new Date(year, month, 0).getDate();

  return days;
}

const formatYearMonthDay = function (longTime, spliter) {
  var date = new Date();
  date.setTime(longTime);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join(spliter)
}

const formatHourMinite = function (longTime, spliter) {
  var date = new Date();
  date.setTime(longTime);
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(spliter)
}

function getWeekStartDateByLongDate(timeStamp) {
  var time = new Date();
  time.setTime(timeStamp);
  var nowYear = time.getFullYear();
  var nowMonth = time.getMonth();
  var nowDay = time.getDate();
  var nowDayOfWeek = time.getDay();
  var date = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
  return Date.parse(date)
}

function getWeekEndDateByLongDatedate(timeStamp) {
  var time = new Date();
  time.setTime(timeStamp);
  var nowYear = time.getFullYear();
  var nowMonth = time.getMonth();
  var nowDay = time.getDate();
  var nowDayOfWeek = time.getDay();
  var date = new Date(nowYear, nowMonth, nowDay + (8 - nowDayOfWeek));
  return Date.parse(date)
}

function getWeekStartDate() {
  var nowYear = new Date().getFullYear();
  var nowMonth = new Date().getMonth();
  var nowDay = new Date().getDate();
  var nowDayOfWeek = new Date().getDay();
  var date = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
  return Date.parse(date)
}

function getWeekEndDate() {
  var nowYear = new Date().getFullYear();
  var nowMonth = new Date().getMonth();
  var nowDay = new Date().getDate();
  var nowDayOfWeek = new Date().getDay();
  var date = new Date(nowYear, nowMonth, nowDay + (8 - nowDayOfWeek));
  return Date.parse(date)
}

function formatDate(date) {
  let myyear = date.getFullYear();
  let mymonth = date.getMonth() + 1;
  let myweekday = date.getDate();
  return [myyear, mymonth, myweekday].map(formatNumber).join('/');
}

function formatStringToNumber(n) {
  n = n.toString();
  if (n.length >= 2) {
    if (n[0] == '0') {
      return n.substr(1);
    } else {
      return n;
    }
  } else {
    return n;
  }
}
//汉字的日期和时间转成long时间
const getLongTimeWithDateAndTime = function (date, dateSpliter, time, timeSpliter) {
  var timeStamp = 0;
  timeStamp = getTimeStampFromYearMonthDay(date, dateSpliter);
  if (time) {
    var tA = time.split(timeSpliter);
    if (tA.length == 2) {
      var hour = tA[0];
      var h = formatStringToNumber(hour);
      timeStamp += h * 60 * 60 * 1000;
      var minu = tA[1];
      var m = formatStringToNumber(minu);
      timeStamp += m * 60 * 1000;
    }
  }
  return timeStamp;
}

/**
 * 传入时间后几天
 * param：传入时间：dates:"2018-04-02",later:往后多少天
 */
function dateLater(dates, later) {
  let dateObj = {};
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  let date = new Date(dates);
  date.setDate(date.getDate() + later);
  let day = date.getDay();
  dateObj.year = date.getFullYear();
  dateObj.month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : date.getMonth() + 1);
  dateObj.day = (date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate());
  dateObj.week = show_day[day];
  return dateObj;
}

const modeMapToFields = {
  YMDhms: "Y-M-D h:m:s",
  YMDhm: "Y-M-D h:m",
  YMD: "Y-M-D",
  YM: "Y-M",
  MD: "M-D",
  hm: "h:m",
}
const adaptIosDateStr = (str) => {
  return str ? str.replace(/-/g, '-') : str;
}


/**
 * 格式化时间为时间戳（支持 年月日时分 | 年月日 | 年月 三种格式）
 * @param {string} timeStr - 时间字符串（示例：2025-12-16 18:30 | 2025-12-16 | 2025-12）
 * @param {string} [separator='-'] - 时间分隔符（默认横杠，可传 / 等）
 * @returns {number} 毫秒级时间戳（无效时间返回 NaN）
 */
function formatToTimestamp(timeStr, separator = '-') {
  // 空值/非字符串校验
  if (!timeStr || typeof timeStr !== 'string') {
    console.error('时间格式错误：请传入有效字符串');
    return NaN;
  }

  // 拆分时间片段（处理 空格/冒号 分隔）
  const [datePart, timePart = '00:00'] = timeStr.split(' ');
  const dateSegments = datePart.split(separator);
  const timeSegments = timePart.split(':');

  // 解析年/月/日/时/分
  const year = Number(dateSegments[0]);
  const month = Number(dateSegments[1]) - 1; // 月份从 0 开始（JS Date 特性）
  const day = Number(dateSegments[2]) || 1;  // 年月格式补“日”为 1
  const hour = Number(timeSegments[0]) || 0; // 补“时”为 0
  const minute = Number(timeSegments[1]) || 0;// 补“分”为 0

  // 校验核心字段（年/月必须有效）
  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    console.error('时间格式错误：年/月无效');
    return NaN;
  }

  // 创建 Date 对象并转为时间戳
  const date = new Date(year, month, day, hour, minute);
  const timestamp = date.getTime();

  // 校验 Date 有效性（如 2025-02-30 这类无效日期）
  if (isNaN(timestamp)) {
    console.error('时间格式错误：无效日期');
    return NaN;
  }

  return timestamp;
}

  /**
   * 获取当日是周几（中文全称，如：周一、周二...周日）
   * @param {Date | number | string} date 可选，指定日期，默认当前日期
   * @returns {string} 中文周几（如：周三）
   */
  function getWeekdayCN(date) {
    // 统一转换为Date对象
    const targetDate = date ? new Date(date) : new Date();
    // 原生getDay()返回 0(周日) - 6(周六)
    const weekDay = targetDate.getDay();
    const weekTextMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekTextMap[weekDay];
  }

  /**
   * 获取当日是几日（数字，如：1、15、31）
   * @param {Date | number | string} date 可选，指定日期，默认当前日期
   * @returns {number} 日期数字（1-31）
   */
   function getDayOfMonth(date) {
    const targetDate = date ? new Date(date) : new Date();
    // 原生getDate()返回当月的日期（1-31）
    return targetDate.getDate();
  }

  /**
   * 获取当日是几月几日（格式化字符串，如：01月01日、12月31日）
   * @param {Date | number | string} date 可选，指定日期，默认当前日期
   * @param {boolean} withLeadingZero 可选，是否补前导0，默认true
   * @returns {string} 格式化后的月日字符串
   */
   function getMonthDay(date, withLeadingZero = true) {
    const targetDate = date ? new Date(date) : new Date();
    // 原生getMonth()返回 0(1月) - 11(12月)，需要+1
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();

    // 补前导0处理
    const formatNum = (num) => withLeadingZero ? num.toString().padStart(2, '0') : num;
    return `${formatNum(month)}月${formatNum(day)}日`;
  }


module.exports = {
  formatTime: formatTime,
  formatLongTime: formatLongTime,
  getTimeStamp: getTimeStamp,
  formatYearMonthDay: formatYearMonthDay,
  formatHourMinite: formatHourMinite,
  getTimeStampFromYearMonthDay: getTimeStampFromYearMonthDay,
  getWeekStartDate: getWeekStartDate,
  formatDate: formatDate,
  getWeekEndDate: getWeekEndDate,
  getLongTimeWithDateAndTime: getLongTimeWithDateAndTime,
  getYear: getYear,
  getMonth: getMonth,
  getDay: getDay,
  getHour: getHour,
  getMinute: getMinute,
  getSecond: getSecond,
  dateLater: dateLater,
  getWeekStartDateByLongDate: getWeekStartDateByLongDate,
  getWeekEndDateByLongDatedate: getWeekEndDateByLongDatedate,
  getCurrentYearMonthDayTimeStamp: getCurrentYearMonthDayTimeStamp,
  getDaysOfMonthInYear,
  getDaysOfMonth,
  modeMapToFields: modeMapToFields,
  adaptIosDateStr,
	formatToTimestamp,
	getWeekdayCN,
	getDayOfMonth,
	getMonthDay
}