const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}


/**
 * 当天
 * @param {*} date 
 */
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')  
}

/** 
* 时间戳转化为年 月 日 时 分 秒 
* number: 传入时间戳 
* format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTimeTwo(number, format) {
 
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
 * 近七天
 * @param {*} last 
 */
const getTimeLastWeek = last => {
  const year = last.getFullYear()
  const day = last.getDate()
  const ti = day - 7
  // 判断是否月初
  if (ti <= 0) {
    const month = last.getMonth() + 1 - 1
    const d = new Date(year, month, 0)
    const dayBig = d.getDate() //获取当月的所有天数
    const ti1 = dayBig + ti
    return [year, month, ti1].map(formatNumber).join('-')
  } else {
    const month = last.getMonth() + 1
    return [year, month, ti].map(formatNumber).join('-')
  }
  // return [year, month, day].map(formatNumber).join('-')

}

/**
 * 近1个月
 * @param {*} last 
 */
const getTimeLastMonth = last => {
  const year = last.getFullYear()
  const day = last.getDate()
  const ti = day - 30 
  // 判断是否月初
  if (ti <= 0) {
    const month = last.getMonth() + 1 - 1
    const d = new Date(year, month, 0)
    const dayBig = d.getDate() //获取当月的所有天数
    const ti1 = dayBig + ti
    return [year, month, ti1].map(formatNumber).join('-')
  } else {
    const month = last.getMonth() + 1
    return [year, month, ti].map(formatNumber).join('-')
  }
}

/**
 * 近3个月
 * @param {*} last 
 */
const getTimeThreeMonth = last => {
  const year = last.getFullYear()
  const month = last.getMonth() + 1
  const day = last.getDate()
  // 判断三个月的开始月份
  const startMonth = month - 3;
  // 判断是否是年初
  if(startMonth <= 0){
    year = year - 1 ;
  }
  return [year, startMonth, day].map(formatNumber).join('-')
}

/**
 * 近3个月
 * @param {*} last 
 */
const getTimeHalfYear = last => {
  const year = last.getFullYear()
  const month = last.getMonth() + 1
  const day = last.getDate()
  // 判断三个月的开始月份
  const startMonth = month - 6;
  // 判断是否是年初
  if(startMonth <= 0){
    year = year - 1 ;
  }
  return [year, startMonth, day].map(formatNumber).join('-')
}

/**
 * 赋0
 * @param {*} n 
 */
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime: formatTime,
  formatDate:formatDate,
  formatTimeTwo: formatTimeTwo,
  getTimeLastWeek:getTimeLastWeek,
  getTimeLastMonth:getTimeLastMonth,
  getTimeThreeMonth:getTimeThreeMonth,
  getTimeHalfYear:getTimeHalfYear
}