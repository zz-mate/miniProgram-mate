export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}


export const getThisDate = (format = 'YY-MM-DD') => {
  let date = new Date(),
    year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    h = date.getHours(),
    m = date.getMinutes();

  //数值补0方法
  const zero = (value) => {
    if (value < 10) return '0' + value;
    return value;
  }

  switch (format) {
    case 'YY-MM':
      return year + '-' + zero(month);
    case 'YY.MM.DD':
      return year + '.' + zero(month) + '.' + zero(day);
    case 'YY-MM-DD':
      return year + '-' + zero(month) + '-' + zero(day);
    case 'YY.MM.DD HH:MM':
      return year + '.' + zero(month) + '.' + zero(day) + ' ' + zero(h) + ':' + zero(m);
    case 'YY/MM/DD HH:MM':
      return year + '/' + zero(month) + '/' + zero(day) + ' ' + zero(h) + ':' + zero(m);
			case 'YY/MM/DD':
      return year + '/' + zero(month) + '/' + zero(day);
    case 'YY-MM-DD HH:MM':
      return year + '-' + zero(month) + '-' + zero(day) + ' ' + zero(h) + ':' + zero(m);
    default:
      return year + '/' + zero(month) + '/' + zero(day);
  }
}
/**
 * 获取当前月份的总天数
 * @returns {number} 当月天数（如28、29、30、31）
 */
export function getCurrentMonthDays() {
  // 1. 获取当前日期对象
  const today = new Date();
  
  // 2. 获取当前年份和当前月份（注意：Date对象的月份是0-11，比如1月是0，12月是11）
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // 3. 关键逻辑：创建「下一个月第0天」的日期对象，它会自动转为「当前月最后一天」
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // 4. 获取这一天的日期数，就是当前月的总天数
  return lastDayOfMonth.getDate();
}

//从本地获取数据
export const getStorageSync = (key: any): any => {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    // console.log(e);
    return undefined; // 或者返回一个默认值，比如 null 或 false，根据具体需求决定
  }
};

//存储数据到storage
export const setStorageSync = (key: string, val: any) => {
  wx.setStorageSync(key, val);
}

//移除某个存储
export const removeStorageSync = (key: string) => {
  wx.removeStorageSync(key)
}

/**
 * 验证中国大陆手机号格式
 * @param phoneNumber - 待验证的手机号字符串
 * @returns 验证结果，true 表示格式正确，false 表示格式错误
 */
export const validatePhoneNumber = (phoneNumber: string): boolean =>{
  // 中国大陆手机号正则表达式：
  // 1. 以 1 开头
  // 2. 第二位为 3-9 (排除了 10, 11 开头的情况)
  // 3. 后面跟 9 位数字
  const phoneRegex = /^1[3-9]\d{9}$/;
  
  // 去除可能存在的空格或分隔符
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  return phoneRegex.test(cleanedNumber);
}
export function matchAndSortArrays({
  targetList = [],
  sourceList = [],
  matchKey = 'category_id',
  assignKeys = [],
  showOnlyMatched = false,
  // 三个默认字段的默认值配置（支持自定义覆盖）
  fieldDefaults = {
    category_amount: "0.00",    // 金额默认 0
  }
} = {}) {
  // 1. 参数合法性校验
  if (!Array.isArray(targetList) || !Array.isArray(sourceList)) {
    console.warn('targetList 和 sourceList 必须是数组');
    return targetList;
  }
  if (typeof matchKey !== 'string' || matchKey.trim() === '') {
    console.warn('matchKey 必须是非空字符串');
    return targetList;
  }
  if (!Array.isArray(assignKeys) || assignKeys.length === 0) {
    console.warn('assignKeys 必须是非空数组');
    return targetList;
  }
  if (typeof showOnlyMatched !== 'boolean') {
    console.warn('showOnlyMatched 必须是布尔值，已自动转为 false');
    showOnlyMatched = false;
  }
  if (typeof fieldDefaults !== 'object' || fieldDefaults === null) {
    console.warn('fieldDefaults 必须是对象，已使用默认配置');
    fieldDefaults = { category_amount: "0.00" };
  }

  // 2. 源数组转 Map（匹配用，保持原有逻辑）
  const sourceMap = new Map();
  sourceList.forEach(sourceItem => {
    const key = sourceItem?.[matchKey] != null ? String(sourceItem[matchKey]) : '';
    if (key) {
      const assignData = {};
      assignKeys.forEach(field => {
        const hasDefault = Object.prototype.hasOwnProperty.call(fieldDefaults, field);
        if (hasDefault) {
          // 有默认值的字段：为空则用配置的默认值
          assignData[field] = sourceItem[field] !== undefined && sourceItem[field] !== null
            ? sourceItem[field]
            : fieldDefaults[field];
        } else {
          // 无默认值的自定义字段：有值则保留
          if (sourceItem[field] !== undefined && sourceItem[field] !== null) {
            assignData[field] = sourceItem[field];
          }
        }
      });
      sourceMap.set(key, assignData);
    }
  });

  // 3. 核心匹配逻辑：标记匹配状态 + 给匹配项赋值
  const processedList = targetList.map(targetItem => {
    const key = targetItem?.[matchKey] != null ? String(targetItem[matchKey]) : '';
    const matchedData = sourceMap.get(key);

    return matchedData
      ? { ...targetItem, ...matchedData, isMatched: true } // 匹配成功：合并源数据
      : { ...targetItem, isMatched: false }; // 匹配失败：仅标记状态
  });

  // -------------- 核心新增：全量字段补全（关键步骤）--------------
  const filledList = processedList.map(item => {
    const filledItem = { ...item }; // 拷贝原数据，避免修改源对象
    assignKeys.forEach(field => {
      const hasDefault = Object.prototype.hasOwnProperty.call(fieldDefaults, field);
      // 规则：字段不存在 / 为 null/undefined → 填充默认值
      if (filledItem[field] === undefined || filledItem[field] === null) {
        filledItem[field] = hasDefault ? fieldDefaults[field] : undefined;
      }
    });
    return filledItem;
  });

  // 4. 排序：匹配项排在前面
  filledList.sort((a, b) => (a.isMatched ? 0 : 1) - (b.isMatched ? 0 : 1));

  // 5. 根据 showOnlyMatched 筛选结果
  const finalList = showOnlyMatched
    ? filledList.filter(item => item.isMatched)
    : filledList;

  // 可选：移除 isMatched 标记
  // finalList.forEach(item => delete item.isMatched);

  return finalList;
}

/**
 * 计算预算剩余百分比
 * @param {number} totalBudget - 总预算金额（必须大于 0）
 * @param {number} spentAmount - 已花费金额（非负）
 * @param {number} [decimalPlaces=2] - 保留小数位数（默认 2 位，可自定义）
 * @returns {number} 剩余百分比（如 60.00 表示 60%）
 */
export function calculateRemainingPercentage(totalBudget, spentAmount, decimalPlaces = 2) {
  // 1. 类型校验与边界处理
  if (typeof totalBudget !== 'number' || typeof spentAmount !== 'number') {
    throw new Error('总预算和已花费金额必须是数字类型');
  }
  if (totalBudget <= 0) {
    throw new Error('总预算必须大于 0');
  }
  if (spentAmount < 0) {
    throw new Error('已花费金额不能为负数');
  }

  // 2. 核心计算：剩余金额 = 总预算 - 已花费金额（最小为 0，避免超支后出现负百分比）
  const remainingAmount = Math.max(totalBudget - spentAmount, 0);
  
  // 3. 计算百分比并保留指定小数位数
  const remainingPercentage = (remainingAmount / totalBudget) * 100;
  
  // 4. 处理小数位数（四舍五入）
  return Number(remainingPercentage.toFixed(decimalPlaces));
}

/**
 * 转换中文日期字符串为指定格式的标准日期字符串
 * @param dateStr - 输入日期字符串（如 "2025年12月31日" 或 "2025年12月"）
 * @param format - 输出格式（支持 "YYYY-MM-DD" | "YYYY-MM" | "YY-MM-DD" | "YY-MM"）
 * @returns 格式化日期字符串 | null（格式错误时）
 */
export function formatDateCNToStandard(
  dateStr: string,
  format: "YYYY-MM-DD" | "YYYY-MM" | "YY-MM-DD" | "YY-MM" = "YYYY-MM-DD"
): string | null {
  // 正则校验格式：支持 YYYY年MM月DD日 或 YYYY年MM月
  const regex = /^(\d{4})年(\d{1,2})月(?:(\d{1,2})日)?$/;
  const match = dateStr.match(regex);
  
  if (!match) {
    console.error("日期格式错误，需满足 YYYY年MM月 或 YYYY年MM月DD日");
    return null;
  }
  
  const [, fullYear, month, day] = match;
  // 补零处理：确保月份/日期为2位
  const formattedMonth = month.padStart(2, "0");
  const formattedDay = day ? day.padStart(2, "0") : "";
  // 两位数年份（取后两位）
  const shortYear = fullYear.slice(-2);

  // 根据指定格式返回对应结果
  switch (format) {
    case "YYYY-MM-DD":
      if (!day) {
        console.error("输入日期无具体日，无法转换为 YYYY-MM-DD 格式");
        return null;
      }
      return `${fullYear}-${formattedMonth}-${formattedDay}`;
    case "YYYY-MM":
      return `${fullYear}-${formattedMonth}`;
    case "YY-MM-DD":
      if (!day) {
        console.error("输入日期无具体日，无法转换为 YY-MM-DD 格式");
        return null;
      }
      return `${shortYear}-${formattedMonth}-${formattedDay}`;
    case "YY-MM":
      return `${shortYear}-${formattedMonth}`;
    default:
      console.error("不支持的输出格式，请检查 format 参数");
      return null;
  }
}

/**
 * 格式化当前时间为指定格式
 * @param format 时间格式，支持占位符：
 * - YYYY：4位年份（如2025）
 * - MM：2位月份（如01/12）
 * - DD：2位日期（如05/31）
 * - HH：2位小时（24小时制，如08/20）
 * - mm：2位分钟（如09/59）
 * - ss：2位秒数（如06/59）
 * @returns 格式化后的时间字符串
 * @example
 * formatCurrentTime("YYYY-MM-DD") → "2025-06-18"
 * formatCurrentTime("YYYY-MM-DD HH:mm:ss") → "2025-06-18 15:30:45"
 * formatCurrentTime("YYYY年MM月DD日 HH时mm分ss秒") → "2025年06月18日 15时30分45秒"
 */
export function formatCurrentTime(format: string = "YYYY-MM-DD HH:mm:ss"): string {
  // 获取当前时间的 Date 对象
  const now = new Date();

  // 解构当前时间的年月日时分秒（补零处理）
  const year = now.getFullYear().toString(); // 4位年
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 月（0-11 → 1-12，补零）
  const day = now.getDate().toString().padStart(2, "0"); // 日（补零）
  const hour = now.getHours().toString().padStart(2, "0"); // 时（24小时制，补零）
  const minute = now.getMinutes().toString().padStart(2, "0"); // 分（补零）
  const second = now.getSeconds().toString().padStart(2, "0"); // 秒（补零）

  // 替换格式占位符
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hour)
    .replace("mm", minute)
    .replace("ss", second);
}

/**
 * 扩展：获取当前时间的年月日时分秒对象（纯数据，无格式化）
 * @returns 包含年、月、日、时、分、秒的对象
 */
export function getCurrentTimeObj() {
  const now = new Date();
  return {
    year: now.getFullYear(), // 数字型，如 2025
    month: now.getMonth() + 1, // 数字型，如 6（1-12）
    day: now.getDate(), // 数字型，如 18
    hour: now.getHours(), // 数字型，如 15
    minute: now.getMinutes(), // 数字型，如 30
    second: now.getSeconds(), // 数字型，如 45
  };
}