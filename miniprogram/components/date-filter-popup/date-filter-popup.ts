import { playBtnAudio } from '../../utils/audioUtil'
import { getThisDate, getStorageSync, getCycleEndDate } from '../../utils/util'

// 日期工具函数集合
const DateUtils = {
	// 格式化日期
	formatDate: (date, format = 'YYYY-MM-DD') => {
		const d = new Date(date);
		if (isNaN(d.getTime())) return '';

		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');

		return format.replace('YYYY', year)
			.replace('MM', month)
			.replace('DD', day);
	},

	// 计算未来日期
	calculateFutureDate: (type) => {
		const now = new Date();
		const targetDate = new Date(now);

		switch (type) {
			case 'YEAR':
				targetDate.setFullYear(now.getFullYear() + 1);
				break;
			case 'HALF_YEAR':
				targetDate.setMonth(now.getMonth() + 6);
				break;
			default:
				return DateUtils.formatDate(now);
		}

		return DateUtils.formatDate(targetDate);
	},

	// 获取指定类型的默认起始日期
	getDefaultStartDate: (type, startLimit, endLimit, filterType = '', defaultDate = '') => {
		const start = new Date(startLimit);
		const year = start.getFullYear() || 2000;

		let defaultStartDate;

		if (filterType === 'YEAR') {
			defaultStartDate = DateUtils.calculateFutureDate('YEAR');
		} else if (filterType === 'HALF_YEAR') {
			defaultStartDate = DateUtils.calculateFutureDate('HALF_YEAR');
		} else {
			switch (type) {
				case 'WEEK':
					const now = new Date();
					const weekDay = now.getDay() || 7;
					const monday = new Date(now);
					monday.setDate(now.getDate() - weekDay + 1);
					defaultStartDate = DateUtils.formatDate(monday);
					break;
				case 'MD':
					defaultStartDate = `${year}-01-01`;
					break;
				case 'D':
					defaultStartDate = `${year}-01-01`;
					break;
				case 'YMD':
					defaultStartDate = '2026-01-15';
					break;
				default:
					defaultStartDate = '2026-01-15';
					break;
			}
		}

		return DateUtils.getValidDate(defaultStartDate, startLimit, endLimit);
	},

	// 获取合法的日期
	getValidDate: (dateStr, startLimit, endLimit) => {
		const date = new Date(dateStr);
		const start = new Date(startLimit);
		const end = new Date(endLimit);

		if (isNaN(date.getTime())) {
			return '2026-01-15';
		}
		if (isNaN(start.getTime())) start.setFullYear(1970, 0, 1);
		if (isNaN(end.getTime())) end.setFullYear(2100, 0, 1);

		if (date.getTime() < start.getTime()) return DateUtils.formatDate(start);
		if (date.getTime() > end.getTime()) return DateUtils.formatDate(end);
		return DateUtils.formatDate(date);
	},

	// 根据类型获取显示文本
	getDisplayTextByType: (type, dateStr, filterType = '') => {
		if (filterType === 'LONG') {
			return '长期有效';
		} else if (filterType === 'YEAR' || filterType === 'HALF_YEAR') {
			return dateStr;
		}

		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return '';

		const year = d.getFullYear();
		const month = d.getMonth() + 1;
		const day = d.getDate();

		switch (type) {
			case 'YMD':
				return `${year}年${month}月${day}日`;
			case 'D':
				return `${day}日`;
			case 'MD':
				return `${month}月${day}日`;
			case 'WEEK':
				const weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
				const weekIndex = d.getDay() || 7;
				return weekNames[weekIndex - 1];
			default:
				return `${year}年${month}月${day}日`;
		}
	},

	// 写死月份天数规则
	getDaysInMonth: (month) => {
		if (month === 2) return 28;
		const bigMonths = [1, 3, 5, 7, 8, 10, 12];
		return bigMonths.includes(month) ? 31 : 30;
	},

	// 根据月份和限制范围计算实际可用的天数
	getAvailableDays: (year, month, startLimit, endLimit, type = 'MD') => {
		const start = new Date(startLimit);
		const end = new Date(endLimit);
		const daysInMonth = DateUtils.getDaysInMonth(month);

		const days = [];
		let startDay = 1;
		let endDay = daysInMonth;

		if (type === 'D') {
			startDay = 1;
			endDay = 28;
		} else {
			if (year === start.getFullYear() && month === start.getMonth() + 1) {
				startDay = start.getDate();
			}
			if (year === end.getFullYear() && month === end.getMonth() + 1) {
				endDay = Math.min(end.getDate(), daysInMonth);
			}
		}

		for (let i = startDay; i <= endDay; i++) {
			days.push(i);
		}

		return days.length === 0 ? [1] : days;
	},

	// 更新MD类型的日期列表
	updateMDDaysList: (month, startLimit, endLimit) => {
		const start = new Date(startLimit);
		const year = start.getFullYear() || 2000;
		return DateUtils.getAvailableDays(year, month, startLimit, endLimit, 'MD');
	},

	// 检测日期是否与类型/范围匹配
	checkDateMatch: (dateStr, type, startLimit, endLimit) => {
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) {
			return {
				isMatch: false,
				reason: '日期格式不合法',
				fixDate: '2026-01-15'
			};
		}

		const start = new Date(startLimit);
		const end = new Date(endLimit);
		if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
			if (date < start || date > end) {
				return {
					isMatch: false,
					reason: `日期超出限制范围(${DateUtils.formatDate(start)}~${DateUtils.formatDate(end)})`,
					fixDate: date < start ? DateUtils.formatDate(start) : DateUtils.formatDate(end)
				};
			}
		}

		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();

		switch (type) {
			case 'D':
				if (day < 1 || day > 28) {
					return {
						isMatch: false,
						reason: '日类型仅支持1-28日',
						fixDate: DateUtils.formatDate(new Date(year, month - 1, Math.min(Math.max(day, 1), 28)))
					};
				}
				break;
			case 'MD':
				if (month < 1 || month > 12) {
					return {
						isMatch: false,
						reason: '月日类型仅支持1-12月',
						fixDate: DateUtils.formatDate(new Date(year, Math.min(Math.max(month, 1), 12) - 1, 1))
					};
				}
				const maxDays = DateUtils.getDaysInMonth(month);
				if (day < 1 || day > maxDays) {
					return {
						isMatch: false,
						reason: `${month}月仅支持1-${maxDays}日`,
						fixDate: DateUtils.formatDate(new Date(year, month - 1, Math.min(Math.max(day, 1), maxDays)))
					};
				}
				break;
			case 'WEEK':
				return { isMatch: true, reason: '', fixDate: dateStr };
		}

		return { isMatch: true, reason: '', fixDate: dateStr };
	},

	// 生成星期数据
	generateWeekDays: () => {
		const now = new Date();
		const weekDay = now.getDay() || 7;
		const monday = new Date(now);
		monday.setDate(now.getDate() - weekDay + 1);

		const weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
		const weekDays = [];

		for (let i = 0; i < 7; i++) {
			const current = new Date(monday);
			current.setDate(monday.getDate() + i);
			weekDays.push({
				weekName: weekNames[i],
				dateStr: DateUtils.formatDate(current),
				timestamp: current.getTime(),
				displayText: weekNames[i]
			});
		}

		return weekDays;
	},

	// 根据type生成对应的日期数据
	generateDateDataByType: (type, defaultDate, startLimit, endLimit, selectedMonth = null, selectedDay = null, filterType = '') => {
		const FALLBACK_DATE = '2026-01-15';
		let validDate = new Date(FALLBACK_DATE);
		const result = {
			years: [],
			months: [],
			days: [],
			weekDays: [],
			pickerViewValue: [],
			displayValue: '',
			year: 2000,
			month: 1,
			day: 1
		};

		if (filterType === 'LONG') {
			result.displayValue = '长期有效';
			result.actualDate = '';
			result.selectedDate = '长期有效';
			return result;
		} else if (filterType === 'YEAR') {
			const futureDate = DateUtils.calculateFutureDate('YEAR');
			validDate = new Date(futureDate);
			result.displayValue = DateUtils.getDisplayTextByType('YMD', futureDate, 'YEAR');
			result.actualDate = futureDate;
			result.selectedDate = result.displayValue;
			result.year = validDate.getFullYear();
			result.month = validDate.getMonth() + 1;
			result.day = validDate.getDate();
			return result;
		} else if (filterType === 'HALF_YEAR') {
			const futureDate = DateUtils.calculateFutureDate('HALF_YEAR');
			validDate = new Date(futureDate);
			result.displayValue = DateUtils.getDisplayTextByType('YMD', futureDate, 'HALF_YEAR');
			result.actualDate = futureDate;
			result.selectedDate = result.displayValue;
			result.year = validDate.getFullYear();
			result.month = validDate.getMonth() + 1;
			result.day = validDate.getDate();
			return result;
		}

		switch (type) {
			case 'YMD':
				let ymdSourceDate = defaultDate;
				const isInvalidDateStr = typeof ymdSourceDate === 'string' &&
					(!ymdSourceDate.includes('-') || isNaN(new Date(ymdSourceDate).getTime()));

				let finalSourceDate = FALLBACK_DATE;
				if (!isInvalidDateStr && ymdSourceDate) {
					finalSourceDate = ymdSourceDate;
				} else {
					try {
						const customDate = getThisDate("YYYY-MM-DD", 1);
						if (customDate && !isNaN(new Date(customDate).getTime())) {
							finalSourceDate = customDate;
						}
					} catch (e) {
						console.warn('getThisDate方法调用失败，使用兜底日期：', e);
					}
				}

				validDate = new Date(finalSourceDate);
				if (isNaN(validDate.getTime())) {
					validDate = new Date(FALLBACK_DATE);
				}

				const ymdYear = validDate.getFullYear();
				const ymdMonth = validDate.getMonth() + 1;
				const ymdDay = validDate.getDate();

				const start = new Date(startLimit);
				const end = new Date(endLimit);
				const startYear = !isNaN(start.getTime()) ? start.getFullYear() : ymdYear;
				const endYear = !isNaN(end.getTime()) ? end.getFullYear() : (startYear + 10);

				for (let i = startYear; i <= endYear; i++) result.years.push(i);
				if (result.years.length === 0) result.years.push(ymdYear);

				const startMonth = ymdYear === startYear ? (start.getMonth() + 1) : 1;
				const endMonth = ymdYear === endYear ? (end.getMonth() + 1) : 12;
				for (let i = startMonth; i <= endMonth; i++) result.months.push(i);
				if (result.months.length === 0) result.months.push(ymdMonth);

				result.days = DateUtils.getAvailableDays(ymdYear, ymdMonth, startLimit, endLimit, 'YMD');
				if (result.days.length === 0) result.days.push(ymdDay);

				const yearIndex = Math.max(result.years.indexOf(ymdYear), 0);
				const monthIndex = Math.max(result.months.indexOf(ymdMonth), 0);
				const dayIndex = Math.max(result.days.indexOf(ymdDay), 0);

				result.pickerViewValue = [yearIndex, monthIndex, dayIndex];
				result.displayValue = DateUtils.getDisplayTextByType('YMD', DateUtils.formatDate(validDate));
				result.year = ymdYear;
				result.month = ymdMonth;
				result.day = ymdDay;
				break;

			case 'MD':
				const mdYear = new Date(startLimit).getFullYear() || 2000;
				const mdMonth = selectedMonth || 1;
				const mdDay = selectedDay || 1;
				validDate = new Date(`${mdYear}-${String(mdMonth).padStart(2, '0')}-${String(mdDay).padStart(2, '0')}`);
				if (isNaN(validDate.getTime())) {
					validDate = new Date(`${mdYear}-01-01`);
				}

				for (let i = 1; i <= 12; i++) result.months.push(i);
				result.days = DateUtils.getAvailableDays(mdYear, mdMonth, '2025-01-01', endLimit, 'MD');
				if (result.days.length === 0) result.days.push(1);

				const mdMonthIndex = Math.max(result.months.indexOf(mdMonth), 0);
				const mdDayIndex = Math.max(result.days.indexOf(mdDay), 0);

				result.pickerViewValue = [mdMonthIndex, mdDayIndex];
				result.displayValue = DateUtils.getDisplayTextByType('MD', DateUtils.formatDate(validDate));
				result.year = mdYear;
				result.month = mdMonth;
				result.day = mdDay;
				break;

			case 'D':
				const dYear = new Date(startLimit).getFullYear() || 2000;
				const dDay = selectedDay || 1;
				validDate = new Date(`${dYear}-01-${String(dDay).padStart(2, '0')}`);
				if (isNaN(validDate.getTime())) {
					validDate = new Date(`${dYear}-01-01`);
				}

				for (let i = 1; i <= 28; i++) result.days.push(i);

				const dDayIndex = Math.max(result.days.indexOf(dDay), 0);

				result.pickerViewValue = [dDayIndex];
				result.displayValue = DateUtils.getDisplayTextByType('D', DateUtils.formatDate(validDate));
				result.year = dYear;
				result.month = 1;
				result.day = dDay;
				break;

			case 'WEEK':
				result.weekDays = DateUtils.generateWeekDays();
				result.pickerViewValue = [0];
				result.displayValue = result.weekDays[0].weekName;
				validDate = new Date(result.weekDays[0].dateStr);
				result.year = validDate.getFullYear();
				result.month = validDate.getMonth() + 1;
				result.day = validDate.getDate();
				break;
		}

		return {
			...result,
			selectedDate: result.displayValue || '',
			actualDate: DateUtils.formatDate(validDate) || FALLBACK_DATE
		};
	},
	/**
	 * 获取当日是周几（中文全称，如：周一、周二...周日）
	 * @param {Date | number | string} date 可选，指定日期，默认当前日期
	 * @returns {string} 中文周几（如：周三）
	 */
	getWeekdayCN: function (date) {
		// 统一转换为Date对象
		const targetDate = date ? new Date(date) : new Date();
		// 原生getDay()返回 0(周日) - 6(周六)
		const weekDay = targetDate.getDay();
		const weekTextMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
		return weekTextMap[weekDay];
	},

	/**
	 * 获取当日是几日（数字，如：1、15、31）
	 * @param {Date | number | string} date 可选，指定日期，默认当前日期
	 * @returns {number} 日期数字（1-31）
	 */
	getDayOfMonth: function (date) {
		const targetDate = date ? new Date(date) : new Date();
		// 原生getDate()返回当月的日期（1-31）
		return targetDate.getDate() + '日';
	},

	/**
	 * 获取当日是几月几日（格式化字符串，如：01月01日、12月31日）
	 * @param {Date | number | string} date 可选，指定日期，默认当前日期
	 * @param {boolean} withLeadingZero 可选，是否补前导0，默认true
	 * @returns {string} 格式化后的月日字符串
	 */
	getMonthDay: function (date, withLeadingZero = true) {
		const targetDate = date ? new Date(date) : new Date();
		// 原生getMonth()返回 0(1月) - 11(12月)，需要+1
		const month = targetDate.getMonth() + 1;
		const day = targetDate.getDate();

		// 补前导0处理
		const formatNum = (num) => withLeadingZero ? num.toString().padStart(2, '0') : num;
		return `${formatNum(month)}月${formatNum(day)}日`;
	},

};

// 组件定义
Component({
	properties: {
		show: { type: Boolean, value: false, observer: "watchShow" }, // 适配弹窗的show监听
		contentHeight: { type: String, value: '45vh' },
		filterList: { type: Array, value: [] },
		defaultActiveIndex: { type: Number, value: 0 },
		showPickerWhen: { type: Array, value: [] },
		defaultDate: { type: String, value: "" },
		startDateLimit: { type: String, value: '1970-01-01' },
		endDateLimit: { type: String, value: '2100-01-31' },
		pickerMode: { type: String, value: 'YMD' },
		isCycleEnd: { type: Boolean, value: false },
		closeOnClickOverlay: { type: Boolean, value: true } // 新增：是否允许点击遮罩关闭
	},

	data: {
		tips: '',
		hidden: false,
		activeIndex: 0,
		shouldShowPicker: false,
		selectedDate: '',
		displayDate: '',
		actualDate: '',
		years: [],
		months: [],
		days: [],
		weekDays: [],
		pickerViewValue: [],
		weekSelectedIndex: 0,
		isShowYear: true,
		isShowMonth: true,
		isShowDay: true,
		isShowWeek: false,
		currentType: 'YMD',
		currentFilterType: '',
		ymdYear: 2026,
		ymdMonth: 1,
		ymdDay: 15,
		mdYear: 2000,
		mdMonth: 1,
		mdDay: 1,
		dYear: 2000,
		dMonth: 1,
		dDay: 1,
		weekYear: new Date().getFullYear(),
		weekMonth: new Date().getMonth() + 1,
		weekDay: new Date().getDate(),
		isInited: false,
		isPicking: false // 新增：标记是否正在滚动选择
	},

	lifetimes: {
		attached() {
			setTimeout(() => {
				this.initComponent();
				this.updatePickerStatus();
			}, 50);
		}
	},

	observers: {
		'selectedDate': function (newDate) {
			if (newDate && newDate !== this.data.displayDate) {
				this.setData({ displayDate: newDate });
			}
		},
		'defaultDate': function (newDate) {
			if (this.data.isInited && newDate) {
				if (this.data.currentType === 'YMD') {
					this.updateYMDDefaultDate(newDate);
				}
			}
		},
		'pickerViewValue': function (newVal) {
			if (this.data.currentType === 'WEEK' && newVal.length > 0) {
				const weekIndex = newVal[0];
				this.setData({ weekSelectedIndex: weekIndex });

				const weekDays = this.data.weekDays;
				if (weekDays && weekDays.length > weekIndex) {
					const selectedWeek = weekDays[weekIndex];
					this.setData({
						selectedDate: selectedWeek.weekName,
						displayDate: selectedWeek.weekName,
						actualDate: selectedWeek.dateStr,
						weekYear: new Date(selectedWeek.dateStr).getFullYear(),
						weekMonth: new Date(selectedWeek.dateStr).getMonth() + 1,
						weekDay: new Date(selectedWeek.dateStr).getDate()
					});
				}
			}
		}
	},

	methods: {
		// 适配统一弹窗的show监听逻辑
		watchShow(newV) {
			if (newV) {
				this.setData({ hidden: false });
			} else {
				this.setData({ hidden: true });
				setTimeout(() => {
					this.setData({ hidden: false });
				}, 300); // 匹配动画时长
			}
		},

		// 适配统一弹窗的遮罩点击事件
		handlePopup() {
			if (this.properties.closeOnClickOverlay) {
				this.triggerEvent('close', { type: 'overlay' });
				this.setData({ show: false });
			}
		},

		updateTypeDefaultDate(newDate) {
			const { currentType, startDateLimit, endDateLimit, currentFilterType } = this.data;
			const dateData = DateUtils.generateDateDataByType(
				currentType, newDate, startDateLimit, endDateLimit, null, null, currentFilterType
			);

			this.updateTypeSpecificVars(currentType, dateData);
			this.setData({
				...dateData,
				selectedDate: dateData.displayValue,
				actualDate: dateData.actualDate,
				displayDate: dateData.displayValue
			});
		},

		updateYMDDefaultDate(newDate) {
			const dateData = DateUtils.generateDateDataByType(
				'YMD', newDate, this.properties.startDateLimit, this.properties.endDateLimit
			);
			this.setData({
				...dateData,
				selectedDate: dateData.displayValue,
				actualDate: dateData.actualDate,
				ymdYear: dateData.year,
				ymdMonth: dateData.month,
				ymdDay: dateData.day
			});
		},

		updatePickerMode(pickerMode) {
			if (!this.properties.filterList || this.properties.filterList.length === 0) {
				const currentType = pickerMode;
				const useDefaultDate = currentType === 'YMD' ? this.properties.defaultDate : '';
				const dateData = DateUtils.generateDateDataByType(
					currentType, useDefaultDate,
					this.properties.startDateLimit, this.properties.endDateLimit
				);

				this.updateTypeSpecificVars(currentType, dateData);
				this.setData({
					currentType,
					shouldShowPicker: this.properties.showPickerWhen.includes(currentType),
					...dateData,
					weekSelectedIndex: currentType === 'WEEK' ? 0 : 0
				});
				this.updateColumnVisibility(currentType);
			}
		},

		updateTypeSpecificVars(type, dateData) {
			const vars = {};
			switch (type) {
				case 'YMD':
					vars.ymdYear = dateData.year;
					vars.ymdMonth = dateData.month;
					vars.ymdDay = dateData.day;
					break;
				case 'MD':
					vars.mdYear = dateData.year;
					vars.mdMonth = dateData.month;
					vars.mdDay = dateData.day;
					break;
				case 'D':
					vars.dYear = dateData.year;
					vars.dMonth = dateData.month;
					vars.dDay = dateData.day;
					break;
				case 'WEEK':
					vars.weekYear = dateData.year;
					vars.weekMonth = dateData.month;
					vars.weekDay = dateData.day;
					break;
			}
			this.setData(vars);
		},

		initComponent() {
			try {
				const props = this.properties;
				const defaultDate = props.defaultDate;
				const startDateLimit = props.startDateLimit;
				const endDateLimit = props.endDateLimit;
				const filterList = props.filterList;
				const defaultActiveIndex = props.defaultActiveIndex;
				const pickerMode = props.pickerMode;

				let currentType = 'YMD';
				let activeIndex = defaultActiveIndex;
				let currentFilterType = '';

				if (filterList && filterList.length > 0) {
					const currentItem = filterList[defaultActiveIndex] || {};
					currentType = currentItem.type || pickerMode;
					currentFilterType = this.getCycleEndFilterType(currentItem.name);
				} else {
					currentType = pickerMode;
					activeIndex = 0;
				}

				const useDefaultDate = currentType === 'YMD' ? defaultDate : '';
				const dateData = DateUtils.generateDateDataByType(
					currentType, useDefaultDate, startDateLimit, endDateLimit, null, null, currentFilterType
				);

				this.updateTypeSpecificVars(currentType, dateData);
				this.setData({
					...dateData,
					activeIndex,
					currentType,
					currentFilterType,
					shouldShowPicker: this.properties.showPickerWhen.includes(currentType) && currentFilterType !== 'LONG',
					weekSelectedIndex: currentType === 'WEEK' ? 0 : 0,
					selectedDate: dateData.selectedDate,
					displayDate: dateData.displayValue,
					actualDate: dateData.actualDate,
					isInited: true
				});

				this.updateColumnVisibility(currentType);

				const matchResult = DateUtils.checkDateMatch(dateData.actualDate, currentType, startDateLimit, endDateLimit);
				if (!matchResult.isMatch) {
					this.triggerEvent('dateMismatch', {
						originalDate: defaultDate,
						fixDate: matchResult.fixDate,
						reason: matchResult.reason,
						type: currentType
					});
				}
			} catch (e) {
				this.setData({ isInited: true });
			}
		},

		getCycleEndFilterType(name) {
			if (name === '长期有效') return 'LONG';
			if (name === '一年后') return 'YEAR';
			if (name === '半年后') return 'HALF_YEAR';
			return '';
		},

		updateColumnVisibility(type) {
			this.setData({
				isShowYear: type === 'YMD',
				isShowMonth: type === 'YMD' || type === 'MD',
				isShowDay: type !== 'WEEK',
				isShowWeek: type === 'WEEK'
			});
		},

		handleFilterTap(e) {
			const index = e.currentTarget.dataset.index;
			const { filterList, startDateLimit, endDateLimit, defaultDate } = this.properties;
			const currentItem = filterList[index] || {};
			const currentType = currentItem.type || 'YMD';
			const currentFilterType = this.getCycleEndFilterType(currentItem.name);
			let changeDate = ''
			console.log(currentType,'00000')
			switch (currentType) {
				// 周维度：今日周几等于选中的周几
				case 'WEEK':

					changeDate = getThisDate('YY-MM-DD')
					break;

				// 日维度：今日几日等于选中的几日
				case 'D':
					changeDate = getThisDate('YY-MM-DD')
					break;

				// 月日维度：今日几月几日等于选中的月日
				case 'MD':
					changeDate = getThisDate('YY-MM-DD')
					break;

				// 其他类型：清空提示语（兜底）
				default:
					changeDate = getThisDate('YY-MM-DD', 1)
					break;
			}
			console.log(changeDate,'=======')
			this.setData({
				selectedDate: changeDate,
				displayDate: changeDate,
		// actualDate: '',
			})
			// getThisDate
			let selectedMonth = null;
			let selectedDay = null;
			if (currentType === 'MD') {
				selectedMonth = 1;
				selectedDay = 1;
			} else if (currentType === 'D') {
				selectedDay = 1;
			} else {
				selectedMonth = this.data.mdMonth;
				selectedDay = this.data.mdDay;
			}

			const useDefaultDate = currentType === 'YMD' ? defaultDate : '';
			const dateData = DateUtils.generateDateDataByType(
				currentType, useDefaultDate, startDateLimit, endDateLimit, selectedMonth, selectedDay, currentFilterType
			);

			this.updateTypeSpecificVars(currentType, dateData);
			this.setData({
				activeIndex: index,
				currentType,
				currentFilterType,
				shouldShowPicker: this.properties.showPickerWhen.includes(currentType) && currentFilterType !== 'LONG',
				...dateData,
				weekSelectedIndex: currentType === 'WEEK' ? 0 : 0,
				selectedDate: dateData.selectedDate,
				displayDate: dateData.displayValue,
				actualDate: dateData.actualDate
			});

			this.updateColumnVisibility(currentType);
			const datas = {
				index,
				type: currentType,
				name: currentItem.name || '',
				selectedDate: dateData.selectedDate,
				actualDate: dateData.actualDate,
				displayDate: dateData.displayValue,
				shouldShowPicker: this.data.shouldShowPicker,
				pickerMode: currentType,
				filterType: currentFilterType
			};
			// 获取当日日期相关信息
			let currentWeek = DateUtils.getWeekdayCN();
			let currentDay = DateUtils.getDayOfMonth();
			let currentMd = DateUtils.getMonthDay(undefined, false);

			// 初始化提示语
			let tips = '';

			// 用switch替换多分支if-else，逻辑与原代码完全一致
			switch (currentType) {
				// 周维度：今日周几等于选中的周几
				case 'WEEK':
					if (currentWeek === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;

					}
					break;

				// 日维度：今日几日等于选中的几日
				case 'D':
					if (currentDay === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;
					}
					break;

				// 月日维度：今日几月几日等于选中的月日
				case 'MD':
					if (currentMd === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;
					}
					break;

				// 其他类型：清空提示语（兜底）
				default:
					tips = '';
					break;
			}

			// 统一设置提示语（替代多次重复的setData）
			this.setData({ tips });






			console.log(datas)
			this.triggerEvent('filterTap', datas);
		},

		handlePickerViewChange(e) {
			const { value } = e.detail;
			const { currentType, currentFilterType, ymdYear, ymdMonth } = this.data;

			if (currentFilterType === 'YEAR' || currentFilterType === 'HALF_YEAR') return;

			let selectedYear = 2000;
			let selectedMonth = 1;
			let selectedDay = 1;
			let newDays = this.data.days;
			let newPickerViewValue = value;

			this.setData({ pickerViewValue: value });

			if (currentType !== 'WEEK') {
				const { years, months, days, mdYear, dYear } = this.data;
				const { startDateLimit, endDateLimit } = this.properties;

				switch (currentType) {
					case 'YMD':
						selectedYear = years[value[0]] || ymdYear;
						selectedMonth = months[value[1]] || ymdMonth;

						if (selectedYear !== ymdYear || selectedMonth !== ymdMonth) {
							selectedDay = 1;
							newDays = DateUtils.getAvailableDays(selectedYear, selectedMonth, startDateLimit, endDateLimit, 'YMD');
							newPickerViewValue = [Math.max(value[0], 0), Math.max(value[1], 0), 0];
						} else {
							selectedDay = newDays[value[2]] || 1;
							newPickerViewValue = [Math.max(value[0], 0), Math.max(value[1], 0), Math.min(value[2], newDays.length - 1)];
						}
						break;

					case 'MD':
						selectedYear = mdYear;
						selectedMonth = months[value[0]] || 1;
						if (selectedMonth !== this.data.mdMonth) {
							newDays = DateUtils.updateMDDaysList(selectedMonth, startDateLimit, endDateLimit);
							selectedDay = 1;
							newPickerViewValue = [Math.max(value[0], 0), 0];
						} else {
							selectedDay = newDays[value[1]] || 1;
							newPickerViewValue = [Math.max(value[0], 0), Math.min(value[1], newDays.length - 1)];
						}
						this.setData({
							mdMonth: selectedMonth,
							mdDay: selectedDay
						});
						break;

					case 'D':
						selectedYear = dYear;
						selectedMonth = 1;
						selectedDay = days[value[0]] || 1;
						newPickerViewValue = [Math.max(value[0], 0)];
						this.setData({
							dDay: selectedDay
						});
						break;
				}

				const selectedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
				const matchResult = DateUtils.checkDateMatch(selectedDate, currentType, startDateLimit, endDateLimit);
				const validDate = matchResult.isMatch ? selectedDate : matchResult.fixDate;
				const validDateObj = new Date(validDate);

				let displayText = '';
				if (currentType === 'D') {
					displayText = `${validDateObj.getDate()}日`;
				} else if (currentType === 'MD') {
					displayText = `${validDateObj.getMonth() + 1}月${validDateObj.getDate()}日`;
				} else {
					displayText = DateUtils.getDisplayTextByType(currentType, validDate);
				}

				this.setData({
					days: newDays,
					pickerViewValue: newPickerViewValue,
					selectedDate: displayText,
					actualDate: validDate,
					displayDate: displayText
				});

				if (!matchResult.isMatch) {
					this.triggerEvent('dateMismatch', {
						originalDate: selectedDate,
						fixDate: matchResult.fixDate,
						reason: matchResult.reason,
						type: currentType
					});
				}
			}
		},

		handleConfirm() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			const { filterList } = this.properties;
			const {
				activeIndex, selectedDate, actualDate, currentType,
				weekSelectedIndex, weekDays, currentFilterType,
				mdYear, dYear, pickerViewValue, months, days
			} = this.data;

			let currentItem = {};
			if (filterList && filterList.length > 0) {
				currentItem = filterList[activeIndex] || {};
			}

			let finalActualDate = actualDate;
			let finalSelectedDate = selectedDate;

			if (currentFilterType === 'LONG') {
				finalActualDate = '';
				finalSelectedDate = '长期有效';
			} else if (currentFilterType === 'YEAR' || currentFilterType === 'HALF_YEAR') {
				finalActualDate = DateUtils.calculateFutureDate(currentFilterType);
				finalSelectedDate = finalActualDate;
			} else if (currentType === 'WEEK' && weekDays && weekDays.length > weekSelectedIndex) {
				finalActualDate = weekDays[weekSelectedIndex].dateStr;
			} else if (currentType === 'MD') {
				const latestMonth = months[pickerViewValue[0]] || 1;
				const latestDay = this.data.days[pickerViewValue[1]] || 1;
				finalActualDate = `${mdYear}-${String(latestMonth).padStart(2, '0')}-${String(latestDay).padStart(2, '0')}`;
				finalSelectedDate = `${latestMonth}月${latestDay}日`;
			} else if (currentType === 'D') {
				const latestDay = days[pickerViewValue[0]] || 1;
				finalActualDate = `${dYear}-01-${String(latestDay).padStart(2, '0')}`;
				finalSelectedDate = `${latestDay}日`;
			}

			const datas = {
				activeIndex,
				selectedType: currentType,
				selectedName: currentItem.name || '',
				selectedDate: finalSelectedDate,
				actualDate: finalActualDate,
				displayDate: finalSelectedDate,
				timestamp: finalActualDate ? new Date(finalActualDate).getTime() : 0,
				pickerMode: currentType,
				filterType: currentFilterType
			};
			this.triggerEvent('confirm', datas);
			this.setData({ show: false }); // 确认后关闭弹窗
		},

		handleCancel() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			this.triggerEvent('cancel');
			this.setData({ show: false }); // 取消后关闭弹窗
		},

		/**
		 * 选择器开始滚动时触发
		 * 1. 标记滚动状态，避免滚动中重复处理
		 * 2. 可以添加滚动开始的交互反馈（如震动、音效）
		 */
		handlePickStart() {
			// 标记正在滚动选择的状态
			this.setData({ isPicking: true });
			// 可选：添加轻量震动反馈，提升用户体验
			wx.vibrateShort({ type: 'light' });
			// 可选：触发自定义事件，供父组件监听
			this.triggerEvent('pickStart', {
				currentType: this.data.currentType,
				currentValue: this.data.pickerViewValue
			});
		},

		/**
		 * 选择器结束滚动时触发
		 * 1. 清除滚动状态标记
		 * 2. 验证最终选择的日期合法性
		 * 3. 同步更新显示值
		 */
		handlePickEnd() {
			// 清除滚动状态标记
			this.setData({ isPicking: false });

			const { currentType, pickerViewValue, endDateLimit } = this.data;

			let changeDate = ''
			console.log(currentType,'00000')
			switch (currentType) {
				// 周维度：今日周几等于选中的周几
				case 'WEEK':

					changeDate = getThisDate('YY-MM-DD')
					break;

				// 日维度：今日几日等于选中的几日
				case 'D':
					changeDate = getThisDate('YY-MM-DD')
					break;

				// 月日维度：今日几月几日等于选中的月日
				case 'MD':
					changeDate = getThisDate('YY-MM-DD')
					break;

				// 其他类型：清空提示语（兜底）
				default:
					changeDate = getThisDate('YY-MM-DD', 1)
					break;
			}
			let actualDate = changeDate
			let startDateLimit = changeDate
			this.setData({
				actualDate:changeDate
			})
			// 验证最终选择的日期是否合法
			if (currentType !== 'WEEK' && actualDate) {
				const matchResult = DateUtils.checkDateMatch(actualDate, currentType, startDateLimit, endDateLimit);
				if (!matchResult.isMatch) {
					// 自动修正不合法的日期
					const validDateObj = new Date(matchResult.fixDate);
					let displayText = '';

					if (currentType === 'D') {
						displayText = `${validDateObj.getDate()}日`;
					} else if (currentType === 'MD') {
						displayText = `${validDateObj.getMonth() + 1}月${validDateObj.getDate()}日`;
					} else {
						displayText = DateUtils.getDisplayTextByType(currentType, matchResult.fixDate);
					}

					this.setData({
						selectedDate: displayText,
						actualDate: matchResult.fixDate,
						displayDate: displayText
					});

					// 触发日期不匹配事件，供父组件处理
					this.triggerEvent('dateMismatch', {
						originalDate: actualDate,
						fixDate: matchResult.fixDate,
						reason: matchResult.reason,
						type: currentType
					});
				}
			}

			// 触发自定义事件，供父组件监听
			this.triggerEvent('pickEnd', {
				currentType: this.data.currentType,
				currentValue: pickerViewValue,
				selectedDate: DateUtils.getMonthDay(changeDate),
				actualDate: changeDate
			});

			console.log('日期选择器结束滚动', {
				type: currentType,
				value: pickerViewValue,
				selectedDate: DateUtils.getMonthDay(changeDate),
				actualDate:changeDate
			});
			// 获取当日日期相关信息
			let currentWeek = DateUtils.getWeekdayCN();
			let currentDay = DateUtils.getDayOfMonth();
			let currentMd = DateUtils.getMonthDay(undefined, false);
			console.log(currentDay)
			// 初始化提示语
			let tips = '';

			// 用switch替换多分支if-else，逻辑与原代码完全一致
			switch (currentType) {
				// 周维度：今日周几等于选中的周几
				case 'WEEK':
					if (currentWeek === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;
					}
					break;

				// 日维度：今日几日等于选中的几日
				case 'D':
					if (currentDay === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;
					}
					break;

				// 月日维度：今日几月几日等于选中的月日
				case 'MD':
					if (currentMd === this.data.selectedDate) {
						tips = `计划将从下${this.data.selectedDate}开始执行，今日不执行`;
					}
					break;

				// 其他类型：清空提示语（兜底）
				default:
					tips = '';
					break;
			}

			// 统一设置提示语（替代多次重复的setData）
			this.setData({ tips });
			console.log(currentType, this.data.selectedDate, this.data.tips)
		},

		updatePickerStatus() {
			const { filterList, showPickerWhen } = this.properties;
			let currentType = this.data.currentType;
			const currentFilterType = this.data.currentFilterType;

			if (!filterList || filterList.length === 0) {
				currentType = this.properties.pickerMode;
			}

			this.setData({
				shouldShowPicker: showPickerWhen.includes(currentType) && currentFilterType !== 'LONG',
				currentType
			});
		}
	}
});