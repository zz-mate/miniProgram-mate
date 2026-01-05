// pages/statement/index.ts
import { COLOR } from '../../utils/color.js';
import { playBtnAudio } from '../../utils/audioUtil'
import { getStorageSync, getThisDate, formatCurrentTime, generateYearGroupList, findYearIndex, generateYearMonthNestedList, findYearMonthInNestedList } from '../../utils/util.js';
import { getBillByMonthChart } from '../../api/statement'
import SystemConfig from '../../utils/capsule';

import * as echarts from '../../components/ec-canvas/echarts';
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';

let startYear = 1970
let endYear = 2100

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		redClor: COLOR.incomeColor,
		greenClor: COLOR.expenseColor,
		isLineExpand: false,
		isPieExpand: false,
		navBarHeight: 0,
		statusBarHeight: 0,
		filterHeight: 0,
		bookInfo: null,
		yearMonthMoreActive: 1,
		tabsList: [{ id: 1, name: "全部" }, { id: 2, name: "年" }, { id: 3, name: "月" }],
		typeIndex: 0, // 0-支出 1-收入
		chartType: 'line', // 图表类型 line/bar
		queryParams: {
			start_time: "" as string,
			end_time: "" as string,
		},
		popupType: "",
		showPopup_year: false,
		showPopup_month: false,
		yearList: generateYearGroupList({ startYear, endYear, groupSize: 10 }),
		groupYearIndex: 0,
		groupMonthIndex: 0,
		isDataYReady: false,
		isDataMReady: false,
		monthList: generateYearMonthNestedList({
			startYear,
			endYear,
			startMonth: 1,
			endMonth: 12
		}),
		MonthLen: 0,
		split_year: '',
		split_month: '',
		chooseYearDate: getThisDate('YY') + '-' + getThisDate("M"),
		ec: {
			lazyLoad: true // 延迟加载
		},
		chartData: {}
	},

	/**
	 * 切换图表类型（折线图/柱状图）
	 */
	toggleChartType() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });

		// 切换图表类型
		const newChartType = this.data.chartType === 'line' ? 'bar' : 'line';
		this.setData({ chartType: newChartType }, () => {
			// 重新渲染图表
			const { typeIndex } = this.data;
			const timeDimension = this.data.queryParams.start_time.length == 4 ? 'month' : 'day';

			// 重新获取组件实例并初始化
			this.echartsComponnetLine = this.selectComponent('#mychart-dom-line');
			if (this.echartsComponnetLine) {
				this.getData('echartsComponnetLine', newChartType, timeDimension);
			}

			// 重新触发当天tooltip
			this.showTodayTooltip && this.showTodayTooltip();
		});
	},

	changeType(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		console.log(evt);
		let { type } = evt.currentTarget.dataset;
		// 只保留支出(0)和收入(1)
		type = type > 1 ? 0 : type;
		this.setData({ typeIndex: type });
		this.getChartData(type);
	},

	/**
	 * 获取图表数据
	 */
	async getChartData(typeIndex) {
		let userInfo = getStorageSync("userInfo");
		let bookInfo = getStorageSync("bookInfo");
		// 只保留支出(2)和收入(1)
		let data = {
			"userId": userInfo.id,
			"bookId": bookInfo.id,
			start_time: this.data.queryParams.start_time + '',
			type: typeIndex == 0 ? 2 : 1
		};
		console.log(data);
		let res = await getBillByMonthChart(data);
		console.log(res.data);
		this.setData({ chartData: res.data.chartData });

		let timeDimension = data.start_time.length == 4 ? 'month' : 'day';
		this.echartsComponnetLine = this.selectComponent('#mychart-dom-line');
		this.showTodayTooltip && this.showTodayTooltip();
		// 传入当前选中的图表类型（line/bar）
		this.getData('echartsComponnetLine', this.data.chartType, timeDimension);
		this.echartsComponnetpie = this.selectComponent('#mychart-dom-pie');
		this.getData('echartsComponnetpie', 'pie', timeDimension);
	},

	/**点击TAB 默认日期 */
	handleChange(evt) {
		const { sub } = evt.detail.delta;
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });

		if (sub == 0) {
			this.setData({
				'queryParams.start_time': '',
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			});
		} else if (sub == 1) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY"),
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			});
		} else if (sub == 2) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY-MM"),
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			});
		}

		this.setData({ yearMonthMoreActive: sub });
		const { typeIndex } = this.data;
		// 只保留支出(0)和收入(1)
		let type_idx = typeIndex == 0 ? 0 : 1;
		this.getChartData(type_idx);
	},

	handleYear(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		this.setData({
			'queryParams.start_time': evt.currentTarget.dataset.year
		});
		// 只保留支出(0)和收入(1)
		let type_idx = this.data.typeIndex == 0 ? 0 : 1;
		this.getChartData(type_idx);
	},

	changeMonth(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		const { current } = evt.detail;
		this.setData({
			groupMonthIndex: current,
			'queryParams.start_time': this.data.monthList[current][0].year,
			split_year: this.data.monthList[current][0].year,
		});
	},

	handleMonth(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		let split_month = evt.currentTarget.dataset.month;
		let { split_year } = this.data;
		let month = split_month < 10 ? '0' + split_month : split_month;

		this.setData({
			'queryParams.start_time': split_year + '-' + month,
			split_month: evt.currentTarget.dataset.month,
			chooseYearDate: split_year + '-' + split_month
		});
		// 只保留支出(0)和收入(1)
		let type_idx = this.data.typeIndex == 0 ? 0 : 1;
		this.getChartData(type_idx);
	},

	/**
	 * 处理弹窗显示 子组件传递
	 * @param {Event} evt - 事件对象
	 */
	handleChildPopup(data: any) {
		let { delta, type } = data.detail;
		if (!type) return;
		this.updatePopupStatus(type, !delta);
	},

	handlePopup() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		const yearMonthMoreActive = this.data.yearMonthMoreActive;
		let type = '';
		switch (yearMonthMoreActive) {
			case 1:
				type = 'year';
				break;
			case 2:
				type = 'month';
				break;
			default:
				type = '';
				break;
		}
		if (!type) return;

		if (type == 'year') {
			let yearIndexInfo = findYearIndex({ targetYear: Number(this.data.queryParams.start_time), yearGroupList: this.data.yearList });
			console.log(yearIndexInfo);
			this.setData({
				groupYearIndex: yearIndexInfo.groupIndex,
				isDataYReady: true,
				'queryParams.start_time': this.data.yearList[yearIndexInfo.groupIndex][yearIndexInfo.innerIndex]
			});
			console.log(this.data.yearList[yearIndexInfo.groupIndex][yearIndexInfo.innerIndex]);
		} else if (type == 'month') {
			let { start_time } = this.data.queryParams;
			let monthIndexInfo = findYearMonthInNestedList({ targetYear: Number(start_time.split('-')[0]), targetMonth: Number(start_time.split('-')[1]), yearMonthNestedList: this.data.monthList });
			console.log(monthIndexInfo);
			this.setData({
				split_month: start_time.split('-')[1],
				split_year: start_time.split('-')[0],
				groupMonthIndex: monthIndexInfo.yearGroupIndex,
				isDataMReady: true
			});
		}
		this.updatePopupStatus(type, true);
	},

	/**
	 * 处理弹窗关闭
	 */
	handleCloseOverlay() {
		const { popupType } = this.data;
		if (!popupType) return;
		this.updatePopupStatus(popupType, false);
	},

	/**
	 * 统一更新弹窗状态的方法
	 * @param {string} type - 弹窗类型
	 * @param {boolean} show - 是否显示弹窗
	 */
	updatePopupStatus(type, show) {
		const key = `${POPUP_SHOW_KEY_PREFIX}${type}`;
		const data = { [key]: show };

		if (type == 'month') {
			let { queryParams, split_year, split_month, chooseYearDate } = this.data;
			if (queryParams.start_time.length == 4) {
				let yy = chooseYearDate.split('-')[0];
				let mm = chooseYearDate.split('-')[1];
				let m = mm < 10 ? '0' + mm : mm;
				this.setData({ 'queryParams.start_time': yy + '-' + m });
			}
		}
		if (show) {
			data.popupType = type;
		}
		this.setData(data);
	},

	/**
	 * 获取图表数据
	 * @param {String} type 组件实例名称（echartsComponnetLine/echartsComponnetpie）
	 * @param {String} chartType 图表类型（line/bar/pie）
	 */
	getData(type, chartType, timeDimension) {
		this[type].init((canvas, width, height, dpr) => {
			const Chart = echarts.init(canvas, null, {
				width: width,
				height: height,
				devicePixelRatio: dpr
			});
			const option = this.getOption(chartType, timeDimension);
			Chart.setOption(option);

			// 初始化主动触发当天tooltip（仅折线/柱状图）
			if (chartType === 'line' || chartType === 'bar') {
				setTimeout(() => {
					const todayIndex = option.todayIndex;
					if (todayIndex >= 0 && todayIndex < option.xAxis[0].data.length) {
						Chart.dispatchAction({
							type: 'showTip',
							seriesIndex: 0,
							dataIndex: todayIndex
						});
					}
				}, 1000);
			}

			return Chart;
		});
	},

	/**
	 * 生成图表标题（适配时间维度和收支类型）
	 * @param {string} timeDimension - month/day
	 * @returns {string} 图表标题
	 */
	generateChartTitle(timeDimension) {
		const { typeIndex, queryParams, yearMonthMoreActive } = this.data;
		// const typeText = typeIndex === 0 ? '支出' : '收入';
		// const timeText = yearMonthMoreActive === 1 ? '年度' : 
		// 				yearMonthMoreActive === 2 ? '月度' : '全部';

		// 获取时间范围文本
		let timeRangeText = '';
		if (queryParams.start_time) {
			if (timeDimension === 'month') {
				// 年度维度：显示年份
				timeRangeText = `${queryParams.start_time}年`;
			} else {
				// 月度维度：显示年月
				const [year, month] = queryParams.start_time.split('-');
				timeRangeText = `${year}年${month}月`;
			}
		} else {
			// 全部维度：显示当前年月
			timeRangeText = `${getThisDate('YYYY')}年${getThisDate('MM')}月`;
		}

		return `${timeRangeText}趋势图`;
	},

	/**
	* 图表init
	* @param {String} chartType 图表类型（line/bar/pie）
	* @returns {Object} 对应类型的图表配置对象
	*/
	getOption(chartType, timeDimension) {
		console.log(this.data.chartData);
		let { lineData, PieData } = this.data.chartData;
		console.log(lineData, 123);

		// 根据传入的类型返回对应配置
		if (chartType === 'line' || chartType === 'bar') {
			// 折线/柱状图共用配置逻辑，通过chartType区分
			const xData = lineData?.xData || [];
			const yData = lineData?.xAxisData || [];
			return this.getLineBarConfig(xData, yData, chartType, timeDimension);
		} else if (chartType === 'pie') {
			return this.getPie(PieData?.list || [], timeDimension);
		}

		// 默认返回折线图配置（兜底）
		let xData = [];
		let yData = [];
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth();
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		xData = Array.from({ length: daysInMonth }, (_, index) => index + 1);
		yData = Array(daysInMonth).fill(0);
		console.log(xData, yData);
		return this.getLineBarConfig(xData, yData, 'line', timeDimension);
	},

	/**
	 * 折线/柱状图通用配置（新增标题 + 边距适配）
	 * @param {Array} xData - X轴数据
	 * @param {Array} yData - Y轴数值数据
	 * @param {string} chartType - 图表类型 line/bar
	 * @param {string} timeDimension - 时间维度 month/day
	 * @returns {Object} ECharts配置项
	 */
	getLineBarConfig(xData, yData, chartType = 'line', timeDimension = 'day') {
		const { queryParams, typeIndex } = this.data;
		const [year = new Date().getFullYear(), month = new Date().getMonth() + 1] = (queryParams.start_time + '').split('-').map(Number);
		console.log(queryParams.start_time);

		// 计算最大值（兼容空数组）
		const maxExpenseValue = yData.length > 0 ? Math.max(...yData) : 0;
		const maxExpenseIndex = yData.length > 0 ? yData.indexOf(maxExpenseValue) : 0;

		// 维度适配：月份维度取当前月份，日期维度取当前日期
		let today, todayIndex, todayData;
		if (timeDimension === 'month') {
			today = new Date().getMonth() + 1;
			todayIndex = today - 1;
			todayData = yData[todayIndex] || 0;
		} else {
			today = new Date().getDate();
			todayIndex = today - 1;
			todayData = yData[todayIndex] || 0;
		}

		// 封装tooltip位置计算函数
		const getTooltipPosition = (pos, params, dom, rect, size) => {
			let chart = null;
			if (params && params[0] && params[0].chart) {
				chart = params[0].chart;
			} else if (this.echartsComponnetLine && this.echartsComponnetLine.getChart) {
				chart = this.echartsComponnetLine.getChart();
			}
			if (!chart) {
				return [pos[0] - size.contentSize[0] / 2, pos[1] - size.contentSize[1] - 10];
			}

			const validMaxIndex = typeof maxExpenseIndex === 'number' && maxExpenseIndex >= 0 ? maxExpenseIndex : 0;
			const validMaxValue = typeof maxExpenseValue === 'number' ? maxExpenseValue : 0;
			const maxPointPos = chart.convertToPixel({ seriesIndex: 0 }, [validMaxIndex, validMaxValue]);

			const finalX = pos[0] - size.contentSize[0] / 2;
			const finalY = maxPointPos[1] - size.contentSize[1] - 10;

			return [finalX, finalY];
		};

		// 格式化tooltip内容
		const formatTooltipContent = (params) => {
			const currentVal = params[0].axisValue.replace(timeDimension === 'month' ? '月' : '日', '');
			const typeText = typeIndex === 0 ? '支出' : '收入'; // 只保留支出/收入

			if (timeDimension === 'month') {
				console.log(year, 11);
				return `{date|${year}年${currentVal}月}\n{money|${typeText}${params[0].data || 0} 元}`;
			} else {
				return `{date|${year}年${month}月${currentVal}日}\n{money|${typeText}${params[0].data || 0} 元}`;
			}
		};

		// 初始化默认显示当天/当月tooltip的内容
		const getDefaultTooltipContent = () => {
			const typeText = typeIndex === 0 ? '支出' : '收入'; // 只保留支出/收入
			if (timeDimension === 'month') {
				return `{date|${year}年${today}月}\n{money|${typeText}${todayData} 元}`;
			} else {
				return `{date|${year}年${month}月${today}日}\n{money|${typeText}${todayData} 元}`;
			}
		};

		// 维度适配：X轴标签间隔
		let axisLabelInterval;
		if (timeDimension === 'month') {
			axisLabelInterval = 1;
		} else {
			axisLabelInterval = Math.max(1, Math.floor(xData.length / 6));
		}

		// 图表系列配置（区分折线/柱状图）
		const seriesConfig = {
			line: {
				type: "line",
				smooth: true,
				lineStyle: {
					color: typeIndex === 0 ? COLOR?.expenseColor : COLOR.incomeColor,
					width: 1
				},
				showSymbol: true,
				symbol: "circle",
				symbolSize: 4,
				itemStyle: {
					color: "#FFF",
					borderWidth: 1,
					borderColor: typeIndex === 0 ? COLOR?.expenseColor : COLOR.incomeColor,
					fontFamily: 'WeChatSansStd'
				},
				areaStyle: {
					normal: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
							offset: 0,
							color: typeIndex === 0 ? COLOR?.expenseColor : COLOR.incomeColor
						}, {
							offset: 1,
							color: '#ffffff'
						}], false)
					}
				}
			},
			bar: {
				type: "bar",
				barWidth: timeDimension === 'month' ? '60%' : '40%', // 柱状图宽度适配
				itemStyle: {
					color: typeIndex === 0 ? COLOR?.expenseColor : COLOR.incomeColor,
					fontFamily: 'WeChatSansStd',
					borderRadius: [3, 3, 0, 0] // 柱状图顶部圆角
				},
				emphasis: {
					itemStyle: {
						color: typeIndex === 0 ? '#d44a4c' : '#e0b040' // 高亮颜色
					}
				}
			}
		};

		// 生成图表标题
		const chartTitle = this.generateChartTitle(timeDimension);

		const option = {
			// ===== 新增：图表标题配置 =====
			title: {
				text: '趋势图',
				// left: 'center', // 标题居中
				top: 0, // 标题距离顶部10px
				textStyle: {
					fontSize: 12, // 标题字体大小
					fontWeight: '600', // 字体粗细
					color: '#333', // 标题颜色
					fontFamily: 'WeChatSansStd' // 字体
				},
				subtextStyle: {
					fontSize: 12,
					color: '#666'
				},
				itemGap: 20 // 标题与副标题间距
			},
			// =============================
			animation: true,
			animationDuration: 1500,
			backgroundColor: "transparent",
			color: [COLOR.expenseColor, COLOR.incomeColor], // 只保留支出/收入颜色

			tooltip: {
				show: true,
				trigger: 'axis',
				triggerOn: 'mousemove',
				confine: true,
				backgroundColor: '#f4f2f7',
				padding: [2, 6],
				borderRadius: [4, 4, 4, 4],
				textStyle: {
					color: '#999999',
					fontSize: 6,
					lineHeight: 1.2, // 关键：设置行高，避免文字重叠
					fontFamily: 'PingFang SC, Microsoft YaHei' // 统一字体 
				},
				shadowBlur: 0,
				shadowColor: 'transparent',
				borderWidth: 0,
				rich: {
					date: {
						color: '#fff',
						fontSize: 6,
						lineHeight: 10, // 行高>字体大小，保证文字显示完整
						fontWeight: '400',
						fontFamily: 'PingFang SC, Microsoft YaHei'
					},
					money: {
						color: '#ffffff',
						fontSize: 6,
						lineHeight: 10, // 与date行高一致，排版整齐
						fontFamily: 'WeChatSansStd, PingFang SC'
					}
				},
				formatter: function (params) {
					if (params && params.length > 0) {
						return formatTooltipContent(params);
					}
					return getDefaultTooltipContent();
				},
				position: getTooltipPosition
			},
			// ===== 调整grid边距：为标题预留空间 =====
			grid: {
				left: 10,
				top: '20%',
				bottom: 20,
				right: 10,
				containLabel: false
			},
			// =======================================
			xAxis: [{
				nameGap: 3,
				nameTextStyle: { color: "#999999", fontSize: 10 },
				type: "category",
				data: xData,
				boundaryGap: chartType === 'bar', // 柱状图需要边界间隙
				axisLine: { rotate: 0, interval: 0, lineStyle: {} },

				axisLabel: {
					color: "#999999",
					fontSize: timeDimension === 'month' ? 10 : 9,
					interval: axisLabelInterval,
					showMinLabel: timeDimension === 'month' ? true : undefined,
					showMaxLabel: timeDimension === 'month' ? true : undefined
				},
				axisTick: {
					show: true,
					interval: timeDimension === 'month' ? 0 : axisLabelInterval
				}
			}],
			yAxis: [{
				type: 'value',
				show: true, // 显示Y轴
				// Y轴刻度线样式
				axisTick: {
					show: false, // 显示Y轴刻度线
					lineStyle: {
						color: '#E5E5E5',
						width: 1
					}
				},
				// Y轴刻度标签样式
				axisLabel: {
					show: true, // 显示Y轴数值标签
					color: '#999999', // 标签颜色
					fontSize: 9, // 标签字体大小
					margin: 10 // 标签与轴线的间距
				},
				// Y轴网格线（水平方向，辅助数据读取）
				splitLine: {
					show: true,
					lineStyle: {
						color: '#F5F5F5', // 浅灰色网格线
						width: 1,
						type: 'dashed'
					}
				},
				// 可选：Y轴数值范围自适应
				scale: true,
				// 可选：设置Y轴最小值为0（适合金额类数据）
				min: 0
			}],
			series: [{
				...seriesConfig[chartType], // 应用折线/柱状图配置
				emphasis: { focus: "series" },
				data: yData,
				triggerEvent: true
			}],
			// 工具栏（切换图表类型）
			toolbox: {
				show: true,
				right: 10,
				top: 0, // 工具栏上移，避开标题
				itemSize: 20,
				feature: {
					myTool: {
						show: true,
						// title: chartType === 'line' ? '切换为柱状图' : '切换为折线图',
						icon: `path://${chartType === 'line' ?
							'M10,18 C10,18 18,8 25,15 C32,22 40,10 45,18 C50,26 58,12 65,18 C72,24 80,18 80,18 M10,18 C8,18 8,16 10,16 M25,15 C23,15 23,13 25,13 M45,18 C43,18 43,16 45,16 M65,18 C63,18 63,16 65,16 M80,18 C78,18 78,16 80,16' :
							'M12,26 L12,8 Q12,6 14,6 L28,6 Q30,6 30,8 L30,26 Q30,28 28,28 L14,28 Q12,28 12,26 Z M35,24 L35,8 Q35,6 37,6 L51,6 Q53,6 53,8 L53,24 Q53,26 51,26 L37,26 Q35,26 35,24 Z M58,20 L58,8 Q58,6 60,6 L74,6 Q76,6 76,8 L76,20 Q76,22 74,22 L60,22 Q58,22 58,20 Z'}`,
						onclick: () => this.toggleChartType()
					}
				}
			}
		};

		// 挂载初始化相关数据
		option.todayIndex = todayIndex;
		option.todayData = todayData;
		option.maxExpenseIndex = maxExpenseIndex;
		option.maxExpenseValue = maxExpenseValue;
		option.defaultTooltipContent = getDefaultTooltipContent();
		option.timeDimension = timeDimension;

		// 初始化完成后显示当天/当月tooltip的方法
		this.showTodayTooltip = () => {
			if (this.echartsComponnetLine && this.echartsComponnetLine.getChart) {
				const chart = this.echartsComponnetLine.getChart();
				chart.dispatchAction({
					type: 'showTip',
					seriesIndex: 0,
					dataIndex: todayIndex,
					position: getTooltipPosition(
						chart.convertToPixel({ seriesIndex: 0 }, [todayIndex, todayData]),
						[{
							chart,
							data: todayData,
							axisValue: `${today}${timeDimension === 'month' ? '月' : '日'}`
						}],
						null,
						null,
						{ contentSize: [80, 30] }
					)
				});
			}
		};

		return option;
	},

	/**
	* 获取ECharts饼图配置（新增标题 + 移除结余相关）
	* @param {Array} data - 饼图数据
	* @param {string} timeDimension - 时间维度：'month'（月份）| 'day'（日期）
	* @returns {Object} ECharts配置项
	*/
	getPie(data, timeDimension = 'day') {
		let { typeIndex } = this.data;

		// 支出颜色数组
		let typeIndexGrColors = [
			'#FFE042', // 浅黄1
			'#FFE666', // 浅黄2
			'#FFEC8A', // 浅黄3
			'#FFF2AE', // 浅黄4
			'#FFF8D2', // 浅黄5
			'#FFE500', // 亮黄1
			'#FFD100', // 亮黄2
			'#FFC107', // 亮黄3
			'#FFB300', // 亮黄4
			'#FFA000', // 亮黄5
			'#FF8F00', // 橙黄1
			'#FF8000', // 橙黄2
			'#F5D000', // 暗黄1
			'#E6C200', // 暗黄2
			'#D9B500', // 暗黄3
			'#CCA800', // 暗黄4
			'#BF9B00'  // 暗黄5
		];

		// 收入颜色数组
		let typeIndexReColors = [
			COLOR.incomeColor,
			'#E55555', '#FF8A65', '#E64A19', '#FFB74D', '#F57C00',
			'#FF5C8A', '#D84315', '#FFAB91', '#FBC02D', '#FF9800',
			'#D32F2F', '#E91E63', '#C71585', '#FFCCBC', '#FFE0B2',
			'#FFD740', '#E65100', '#BF360C', '#FF7043', '#FFCA28',
			'#F4511E', '#E0F2F1'
		];

		// 无数据兜底逻辑
		const isEmptyData = !data || data.length === 0 || (data.length === 1 && !data[0].value && !data[0].count);
		const renderData = isEmptyData ? [{
			name: '暂无数据',
			value: 100,
			itemStyle: { color: '#e5e5e5' },
			label: { show: false, formatter: '暂无数据', color: '#999', fontSize: 12,fontFamily: 'WeChatSansStd' },
			labelLine: { show: false }
		}] : data;

		// 生成饼图标题
		// const typeText = typeIndex === 0 ? '支出' : '收入';
		// const timeRangeText = this.data.queryParams.start_time ?
		// 	(this.data.queryParams.start_time.length === 4 ?
		// 		`${this.data.queryParams.start_time}年` :
		// 		`${this.data.queryParams.start_time.replace('-', '年')}月`) :
		// 	`${getThisDate('YYYY')}年${getThisDate('MM')}月`;
		// const pieTitle = `${timeRangeText}分类占比图`;

		// 数据量判断
		const dataLength = renderData.length;
		const isLargeData = dataLength > 10;
		const isMonthDimensionLarge = timeDimension === 'month' && dataLength > 15;

		let option = {
			// ===== 新增：饼图标题配置 =====
			title: {
				text: '分类占比',
				// left: 'center',
				top: 0,
				textStyle: {
					fontSize: 12, // 标题字体大小
					fontWeight: '600', // 字体粗细
					color: '#333',
					fontFamily: 'WeChatSansStd'
				}
			},
			// =============================
			color: typeIndex == 0 ? typeIndexGrColors : typeIndexReColors, // 只保留支出/收入颜色
			animation: true,
			animationDuration: isEmptyData ? 1000 : (isMonthDimensionLarge ? 2500 : (isLargeData ? 2000 : 5000)),
			animationEasing: isEmptyData ? "linear" : (isMonthDimensionLarge ? "linear" : (isLargeData ? "linear" : "bounceOut")),
			animationThreshold: isMonthDimensionLarge ? 25 : (isLargeData ? 20 : 8),
			animationDurationUpdate: isMonthDimensionLarge ? 1500 : (isLargeData ? 1000 : 3000),
			animationDelay: function (idx) {
				return idx * (timeDimension === 'month' ? 15 : 20);
			},
			backgroundColor: 'transparent',
			tooltip: isEmptyData ? {
				show: false
			} : {
					trigger: "item",
					formatter: "{b} : {c} ({d}%)",
					position: function (point, params, dom, rect, size) {
						let x = 0;
						let y = 0;
						let pointX = point[0];
						let pointY = point[1];
						let boxWidth = size.contentSize[0];
						let boxHeight = size.contentSize[1];
						if (boxWidth > pointX) {
							x = 5;
						} else {
							x = pointX - boxWidth;
						}
						if (boxHeight > pointY) {
							y = 5;
						} else {
							y = pointY - boxHeight;
						}
						return [x, y];
					},
					backgroundColor: '#f4f2f7',
					padding: [2, 6],
					borderRadius: [4, 4, 4, 4],
					textStyle: { color: '#999999', fontSize: 8 },
					shadowBlur: 0,
					shadowColor: 'transparent',
					borderWidth: 0
				},
			// ===== 调整饼图位置：为标题预留空间 =====
			grid: {
				top: 40 // 顶部边距增加，适配标题
			},
			// =======================================
			toolbox: {
				show: !isEmptyData,
				feature: {},
			},
			series: [{
				minAngle: isEmptyData ? 360 : 5,
				avoidLabelOverlap: true,
				labelLine: {
					minTurnAngle: 30,
					length: timeDimension === 'month' ? 20 : 15,
					length2: timeDimension === 'month' ? 25 : 20,
					smooth: 0.2,
					showAbove: true,
					lineStyle: { width: 1, color:  '#ccc'}

					// color: (params) => params.data.color || '#ccc'
				},
				type: "pie",
				radius: [50, 80],
				center: ["50%", "60%"], // 饼图向下偏移10%，避开标题
				itemStyle: { borderRadius: 0, borderColor: '#fff', borderWidth: 0 ,},
				// color: (params) => params.data.color || '#ccc',
				label: {
					show: !isEmptyData,
					position: "outside",
					formatter: '{b}: {c} ({d}%)',
					color: '#999999',
					fontSize: 10,
					fontFamily: 'WeChatSansStd',
					distance: 25,
					rotate: 0,
					alignTo: 'labelLine',
					overflow: 'break',
					silent: false,
					lineHeight: 12
				},
				data: renderData
			}],
			graphic: { elements: [] }
		};
		return option;
	},

	/**
	 * 切换折叠/展开状态 折线图
	 */
	toggleLineExpand() {
		wx.vibrateShort({ type: 'heavy' });
		this.setData({ isLineExpand: !this.data.isLineExpand });
	},

	/**
	 * 切换折叠/展开状态 环形图
	 */
	togglePieExpand() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
		this.setData({ isPieExpand: !this.data.isPieExpand });
	},

	/**
	 * 跳转到日期账单列表
	 */
	handleDatePage(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' });

		let { typeIndex } = this.data;
		// 只保留支出(2)和收入(1)
		let transactionType = typeIndex == 0 ? 2 : 1;

		let bookInfo = getStorageSync("bookInfo");
		let userInfo = getStorageSync("userInfo");
		let { date, category_id, category_name, title, chart } = evt.currentTarget.dataset;
		console.log(evt)
		let url = "/subPackages/pages/transaction/date/index?start_time=" + date +
			'&type=' + transactionType +
			'&bookId=' + bookInfo.id +
			'&userId=' + userInfo.id +
			'&categoryId=' + category_id +
			'&categoryName=' + category_name +
			'&title=' + title + '&yearMonthMoreActive=2'

		console.log(chart, date);

		if (date.toString().length <= 4 && chart == 'line') {
			wx.navigateTo({
				url: `/subPackages/pages/transaction/bill/index?date=${date}&bookId=${bookInfo.id}&userId=${userInfo.id}&type=${transactionType}&yearMonthMoreActive=${transactionType == 2 ? 1 : 2}`,
				routeType: "wx://upwards"
			})
		} else if (date.toString().length <= 4 && chart == 'pie') {
			wx.navigateTo({
				url: `/subPackages/pages/transaction/cate-bill/index?date=${date}&bookId=${bookInfo.id}&userId=${userInfo.id}&type=${transactionType}&yearMonthMoreActive=${transactionType == 2 ? 1 : 2}&categoryId=${category_id}`,
				routeType: "wx://upwards"
			})
		} else {
			wx.navigateTo({ url, routeType: "wx://upwards" });
		}

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		const capsuleConfig = SystemConfig.getCapsuleConfig();
		const query = wx.createSelectorQuery();
		query.select('.filter-date').boundingClientRect();
		query.exec((res) => {
			if (res) {
				this.setData({ filterHeight: res[0].height });
			}
		});

		this.setData({
			navBarHeight: capsuleConfig.navBarHeight,
			statusBarHeight: capsuleConfig.statusBarHeight,
		});

		const { yearMonthMoreActive } = this.data;
		if (yearMonthMoreActive == 1) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY"),
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			});
		}

		const { typeIndex } = this.data;
		let type_idx = typeIndex == 0 ? 0 : 1; // 只保留支出/收入
		this.getChartData(type_idx);
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.getTabBar().setData({ selected: 3 });
		let { typeIndex } = this.data;
		let token = getStorageSync("token");
		if (!token) return;
		this.getChartData(typeIndex);
		this.setData({ bookInfo: getStorageSync("bookInfo") });
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() { },

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() { },

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() { }
});