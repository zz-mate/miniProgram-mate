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
		case 'YY':
			return year;
			case 'M':
				return month;
		case 'MM':
			return zero(month);
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
export const validatePhoneNumber = (phoneNumber: string): boolean => {
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
	matchKey = 'category_id', // 源数据的匹配键
	targetMatchKey = matchKey, // 目标列表的匹配键（新增：解决源/目标键名不一致问题）
	assignKeys = [],
	showOnlyMatched = false,
	fieldDefaults = {
		category_amount: "0.00",
		category_actual_amount: "0.00"
	},
	sortUnmatchedBySortOrder = true
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
	if (typeof targetMatchKey !== 'string' || targetMatchKey.trim() === '') {
		console.warn('targetMatchKey 必须是非空字符串');
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
		fieldDefaults = { category_amount: "0.00", category_actual_amount: "0.00" };
	}
	if (typeof sortUnmatchedBySortOrder !== 'boolean') {
		sortUnmatchedBySortOrder = true;
	}

	// 2. 源数组转 Map（关键：用源数据的 matchKey）
	const sourceMap = new Map();
	sourceList.forEach(sourceItem => {
		if (!sourceItem) return;
		// 源数据的匹配键值（如 budgetCategoryData 的 category_id）
		const sourceKey = sourceItem[matchKey] != null ? String(sourceItem[matchKey]) : '';
		if (!sourceKey) return;

		const assignData = {};
		assignKeys.forEach(field => {
			const hasDefault = Object.prototype.hasOwnProperty.call(fieldDefaults, field);
			// 保留源数据的真实值，而非直接用默认值
			if (sourceItem[field] !== undefined && sourceItem[field] !== null) {
				assignData[field] = sourceItem[field];
			} else if (hasDefault) {
				assignData[field] = fieldDefaults[field];
			}
		});
		sourceMap.set(sourceKey, assignData);
	});

	// 3. 核心匹配逻辑（关键：目标列表用 targetMatchKey 匹配）
	const processedList = targetList.map(targetItem => {
		if (!targetItem) return { isMatched: false };
		// 目标列表的匹配键值（如 baseCategoryList 的 id）
		const targetKey = targetItem[targetMatchKey] != null ? String(targetItem[targetMatchKey]) : '';
		const matchedData = sourceMap.get(targetKey);

		if (matchedData) {
			// 匹配成功：合并源数据的真实值
			return { ...targetItem, ...matchedData, isMatched: true };
		} else {
			// 匹配失败：填充默认值
			const defaultData = {};
			assignKeys.forEach(field => {
				defaultData[field] = fieldDefaults[field] || undefined;
			});
			return { ...targetItem, ...defaultData, isMatched: false };
		}
	});

	// 4. 排序：isMatched 优先 + sort_order 升序
	processedList.sort((a, b) => {
		if (a.isMatched && !b.isMatched) return -1;
		if (!a.isMatched && b.isMatched) return 1;
		if (sortUnmatchedBySortOrder) {
			const aSort = Number(a.sort_order) || 0;
			const bSort = Number(b.sort_order) || 0;
			return aSort - bSort;
		}
		return 0;
	});

	// 5. 筛选 + 移除标记
	const finalList = showOnlyMatched
		? processedList.filter(item => item.isMatched)
		: processedList;
	finalList.forEach(item => delete item.isMatched);

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



/********************** */
// ================== 类型增强版（可选，推荐） ==================
// 定义入参类型接口，提升可读性和复用性
interface GenerateYearGroupOptions {
	startYear: number;
	endYear: number;
	groupSize?: number;
}

/**
 * 类型增强版：生成按指定数量分组的年份二维数组
 * @param {GenerateYearGroupOptions} options - 配置项
 * @returns {number[][]} 分组后的年份二维数组
 */
export function generateYearGroupList({
	startYear,
	endYear,
	groupSize = 10
}: GenerateYearGroupOptions): number[][] {
	// 复用上述校验逻辑
	if (
		Number.isNaN(startYear) ||
		Number.isNaN(endYear) ||
		startYear > endYear
	) {
		console.error('参数错误：起始年份/结束年份必须为有效数字，且起始年份 ≤ 结束年份');
		return [];
	}

	if (Number.isNaN(groupSize) || groupSize < 1) {
		console.error('参数错误：每组数量必须为大于 0 的有效数字');
		return [];
	}

	const allYears: number[] = [];
	for (let year = startYear; year <= endYear; year++) {
		allYears.push(year);
	}

	const yearGroupList: number[][] = [];
	for (let i = 0; i < allYears.length; i += groupSize) {
		yearGroupList.push(allYears.slice(i, i + groupSize));
	}

	return yearGroupList;
}

/**
 * 类型增强版：通过年份查找其在分组数组中的索引（适配 generateYearGroupListV2）
 * @param options 配置项 { targetYear: 目标年份, yearGroupList: 分组数组 }
 * @returns { groupIndex: number; innerIndex: number } 分组索引 + 组内索引；找不到返回 -1
 */
export function findYearIndex({
	targetYear,
	yearGroupList
}: {
	targetYear: number;
	yearGroupList: number[][];
}): { groupIndex: number; innerIndex: number } {
	// 参数校验
	if (Number.isNaN(targetYear)) {
		console.error('参数错误：目标年份必须为有效数字');
		return { groupIndex: -1, innerIndex: -1 };
	}
	if (!Array.isArray(yearGroupList) || yearGroupList.length === 0) {
		console.error('参数错误：年份分组数组不能为空');
		return { groupIndex: -1, innerIndex: -1 };
	}

	// 遍历查找
	for (const [groupIndex, group] of yearGroupList.entries()) {
		const innerIndex = group.indexOf(targetYear);
		if (innerIndex !== -1) {
			return { groupIndex, innerIndex };
		}
	}

	console.warn(`未找到年份 ${targetYear} 在分组数组中`);
	return { groupIndex: -1, innerIndex: -1 };
}
/********************** */


/**
 * 入参配置接口：生成年份+月份嵌套数组
 */
interface GenerateYearMonthNestedOptions {
	startYear: number;    // 起始年份（必填）
	endYear: number;      // 结束年份（必填）
	startMonth?: number;  // 起始月份（可选，默认1）
	endMonth?: number;    // 结束月份（可选，默认12）
	monthGroupSize?: number; // 月份每组数量（固定12，一行6个+两行）
}

/**
 * 生成年份+月份嵌套二维数组（适配指定格式）
 * @param options 配置项
 * @returns 嵌套数组：[[{year: 'xxxx', monthList: [[1-6], [7-12]]}], ...]
 */
export function generateYearMonthNestedList({
	startYear,
	endYear,
	startMonth = 1,
	endMonth = 12,
	monthGroupSize = 12
}: GenerateYearMonthNestedOptions): Array<Array<{
	year: string;
	monthList: number[][];
}>> {
	// 1. 基础参数校验
	if (
		Number.isNaN(startYear) ||
		Number.isNaN(endYear) ||
		startYear > endYear
	) {
		console.error('参数错误：起始年份/结束年份必须为有效数字，且起始年份 ≤ 结束年份');
		return [];
	}

	if (
		Number.isNaN(startMonth) ||
		Number.isNaN(endMonth) ||
		startMonth < 1 ||
		endMonth > 12 ||
		startMonth > endMonth
	) {
		console.error('参数错误：月份需为1-12的有效数字，且起始月份 ≤ 结束月份');
		return [];
	}

	if (Number.isNaN(monthGroupSize) || monthGroupSize < 1) {
		monthGroupSize = 12;
	}

	// 2. 生成年份数组 + 嵌套月份数据
	const result: Array<Array<{ year: string; monthList: number[][] }>> = [];

	for (let year = startYear; year <= endYear; year++) {
		// 生成当前年份的月份一维数组（1-12）
		const allMonths: number[] = [];
		for (let month = startMonth; month <= endMonth; month++) {
			allMonths.push(month);
		}

		// 拆分月份为二维数组（一行6个、两行：[[1-6], [7-12]]）
		const monthList: number[][] = [];
		for (let i = 0; i < allMonths.length; i += 6) { // 关键：按6个拆分（一行6个）
			const monthGroup = allMonths.slice(i, i + 6);
			monthList.push(monthGroup);
		}

		// 3. 按指定格式封装：外层数组套内层数组，每个内层包含一个年份对象
		result.push([{
			year: String(year), // 年份转为字符串
			monthList: monthList // 月份二维数组（[[1-6], [7-12]]）
		}]);
	}

	return result;
}

/**
 * 辅助函数：查找指定年份+月份在嵌套数组中的索引
 * @param options 配置项
 * @returns { yearGroupIndex: number; yearInnerIndex: number; monthInnerIndex: {row: number; col: number} }
 */
export function findYearMonthInNestedList({
	targetYear,
	targetMonth,
	yearMonthNestedList
}: {
	targetYear: number;
	targetMonth: number;
	yearMonthNestedList: ReturnType<typeof generateYearMonthNestedList>;
}): {
	yearGroupIndex: number;
	yearInnerIndex: number;
	monthInnerIndex: { row: number; col: number };
} {
	// 参数校验
	if (Number.isNaN(targetYear) || Number.isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
		console.error('参数错误：目标年份/月份无效，月份需为1-12');
		return { yearGroupIndex: -1, yearInnerIndex: -1, monthInnerIndex: { row: -1, col: -1 } };
	}
	if (!Array.isArray(yearMonthNestedList) || yearMonthNestedList.length === 0) {
		console.error('参数错误：年份月份嵌套数组不能为空');
		return { yearGroupIndex: -1, yearInnerIndex: -1, monthInnerIndex: { row: -1, col: -1 } };
	}

	// 遍历查找年份
	for (const [yearGroupIndex, yearGroup] of yearMonthNestedList.entries()) {
		for (const [yearInnerIndex, yearItem] of yearGroup.entries()) {
			if (yearItem.year === String(targetYear)) {
				// 查找月份在monthList中的行/列（一行6个）
				for (const [row, monthRow] of yearItem.monthList.entries()) {
					const col = monthRow.indexOf(targetMonth);
					if (col !== -1) {
						return {
							yearGroupIndex,
							yearInnerIndex,
							monthInnerIndex: { row, col }
						};
					}
				}
				// 找到年份但未找到月份
				return {
					yearGroupIndex,
					yearInnerIndex,
					monthInnerIndex: { row: -1, col: -1 }
				};
			}
		}
	}

	// 未找到年份
	return { yearGroupIndex: -1, yearInnerIndex: -1, monthInnerIndex: { row: -1, col: -1 } };
}