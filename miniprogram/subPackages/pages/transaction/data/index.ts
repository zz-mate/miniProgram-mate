// subPackages/pages/transaction/data/index.ts
import { getStorageSync } from '../../../../utils/util';
import { getBillByMonthChart } from '../../../../api/statement'
import SystemConfig from '../../../../utils/capsule';
import { COLOR } from '../../../../utils/color.js';
import * as echarts from '../../../../components/ec-canvas/echarts';
import {playBtnAudio} from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title:'',
		popupType: '',
		showPopup_date: false,
		navBarHeight: 0,
		statusBarHeight: 0,
		filterHeight: 0,
		padding: [0, 16, 0, 16],

		cycleList: [{ "xx": 'xx', title: "年" }, { "xx": 'xx', title: "季" }, { "xx": 'xx', title: "月" }, { "xx": 'xx', title: "周" }, { "xx": 'xx', title: "日" }],
		rangeList: [{ "xx": 'xx', title: "近1年" }, { "xx": 'xx', title: "近30天" }, { "xx": 'xx', title: "近7天" }, { "xx": 'xx', title: "自定义" }],

		navBgColor: COLOR.white,
		redClor: COLOR.incomeColor,
		greenClor: COLOR.expenseColor,
		yellowClor: COLOR.jyColor,
		isLineExpand: false,
		isPieExpand: false,
		queryParams: {
			timeType: '',
			year: '2025',
			month: '12'
		},
		start_time: '',
		typeList: [{ color: COLOR.expenseColor, name: '支出' }, { color: COLOR.incomeColor, name: '收入' }, { color: COLOR.jyColor, name: '结余' }],
		typeIndex: 0,
		ec: {
			lazyLoad: true // 延迟加载
		},
		chartData: {

		}
	},
	/**
	 * 获取图表数据
	 * 
	 */
	async getChartData(typeIndex) {
		let userInfo = getStorageSync("userInfo")
		let bookInfo = getStorageSync("bookInfo")
		let data = {
			"userId": userInfo.id,
			"bookId": bookInfo.id,
			start_time: this.data.start_time,
			type: typeIndex == 0 ? 2 : typeIndex == 1 ? 1 : 100
		}
		let res = await getBillByMonthChart(data)
		console.log(res.data)
		this.setData({
			chartData: res.data.chartData
		})


		this.echartsComponnetLine = this.selectComponent('#mychart-dom-line');
		this.showTodayTooltip && this.showTodayTooltip();
		// 传入类型标识 'line'，指定获取折线图配置
		this.getData('echartsComponnetLine', 'line');
		this.echartsComponnetpie = this.selectComponent('#mychart-dom-pie');
		// 传入类型标识 'pie'，指定获取饼图配置
		this.getData('echartsComponnetpie', 'pie');


	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function ({ date,title }) {
		const capsuleConfig = SystemConfig.getCapsuleConfig();
		const query = wx.createSelectorQuery();
		query.select('.filter-content').boundingClientRect();
		query.exec((res) => {
			if (res) {
				this.setData({
					filterHeight: res[0].height
				});
			}
		})
		// console.log(typeIndex)
		this.setData({
			navBarHeight: capsuleConfig.navBarHeight,
			statusBarHeight: capsuleConfig.statusBarHeight,
			start_time: date,
			title
			// typeIndex: typeIndex == '0' ? 2 : typeIndex == '1' ? 0 : 1
		});
		// let { typeIndex } = this.data
		// let token = getStorageSync("token")
		// if (!token) return
		// this.getChartData(typeIndex)
	},
	onShow() {
		let { typeIndex } = this.data
		let token = getStorageSync("token")
		if (!token) return
		this.getChartData(typeIndex)
	},

	/**
	 * 获取图表数据
	 * @param {String} type 组件实例名称（echartsComponnetLine/echartsComponnetpie）
	 * @param {String} chartType 图表类型（line/pie）
	 */
	getData(type, chartType) {
		this[type].init((canvas, width, height, dpr) => {
			const Chart = echarts.init(canvas, null, {
				width: width,
				height: height,
				devicePixelRatio: dpr
			});
			const option = this.getOption(chartType);
			Chart.setOption(option);

			// 初始化主动触发当天tooltip
			if (chartType === 'line') {
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
	* 图表init
	* @param {String} chartType 图表类型（line/pie）
	* @returns {Object} 对应类型的图表配置对象
	*/
	getOption(chartType) {
		// 定义折线图数据
		console.log(this.data.chartData)
		let { lineData, PieData } = this.data.chartData
		console.log(lineData, 123)
		// 根据传入的类型返回对应配置
		if (chartType === 'line') {
			return this.getLine(lineData.xData, lineData.xAxisData);
		} else if (chartType === 'pie') {
			return this.getPie(PieData.list);
		}
		// 默认返回折线图配置（兜底）
		// 若 xData 为空数组，则获取当前月天数并填充
		let xData = []
		let yData = []
		// 1. 获取当前日期对象
		const now = new Date();
		// 2. 获取当前年份（4位）
		const currentYear = now.getFullYear();
		// 3. 获取当前月份（注意：getMonth() 返回 0-11，对应1-12月）
		const currentMonth = now.getMonth();
		// 4. 计算当前月的总天数：new Date(年, 月+1, 0) 表示「当月最后一天」
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

		// 5. 生成 1~当月天数 的数组，填充到 xData
		xData = Array.from({ length: daysInMonth }, (_, index) => index + 1);
		yData = Array(daysInMonth).fill(0);
		console.log(xData, yData)
		return this.getLine(xData, yData);
	},

	/**
 * 获取ECharts折线图配置
 * @param {Array} xData - X轴日期数据（如['1日','2日',...]）
 * @param {Array} yData - Y轴数值数据
 * @returns {Object} ECharts配置项
 */
getLine(xData, yData) {
	const { start_time, typeIndex } = this.data;
	const [year = new Date().getFullYear(), month = new Date().getMonth() + 1] = (start_time || '').split('-').map(Number);
	
	// 计算收入数据的最大值（兼容空数组）
	const maxExpenseValue = yData.length > 0 ? Math.max(...yData) : 0;
	// 找到最大值对应的索引（兼容无数据场景）
	const maxExpenseIndex = yData.length > 0 ? yData.indexOf(maxExpenseValue) : 0;
	// 获取当天的日期（数字）和对应的索引
	const today = new Date().getDate();
	const todayIndex = today - 1;
	// 缓存当天数据（用于初始化默认显示）
	const todayData = yData[todayIndex] || 0;

	// 封装tooltip位置计算函数（位置永远在最上方）
	const getTooltipPosition = (pos, params, dom, rect, size) => {
			// 第一步：先安全获取chart实例
			let chart = null;
			if (params && params[0] && params[0].chart) {
					chart = params[0].chart;
			} else if (this.echartsComponnetLine && this.echartsComponnetLine.getChart) {
					chart = this.echartsComponnetLine.getChart();
			}
			if (!chart) {
					return [pos[0] - size.contentSize[0] / 2, pos[1] - size.contentSize[1] - 10];
			}

			// 第二步：位置计算（垂直永远在最大值最上方，水平跟随当前点）
			const validMaxIndex = typeof maxExpenseIndex === 'number' && maxExpenseIndex >= 0 ? maxExpenseIndex : 0;
			const validMaxValue = typeof maxExpenseValue === 'number' ? maxExpenseValue : 0;
			const maxPointPos = chart.convertToPixel({ seriesIndex: 0 }, [validMaxIndex, validMaxValue]);

			// 所有点的垂直位置都固定在最大值上方，水平跟随当前点
			const finalX = pos[0] - size.contentSize[0] / 2; // 水平居中当前hover点
			const finalY = maxPointPos[1] - size.contentSize[1] - 10; // 垂直固定最上方

			return [finalX, finalY];
	};

	// 格式化tooltip内容（抽离成独立函数，方便复用）
	const formatTooltipContent = (params) => {
			const currentDay = params[0].axisValue.replace('日', ''); // 当前hover的日期
			const currentValue = params[0].data || 0; // 当前hover的数值
			const typeText = typeIndex === 0 ? '支出' : typeIndex === 1 ? '收入' : '结余';
			return `{date|${year}年${month}月${currentDay}日}\n{money|${typeText}${currentValue} 元}`;
	};

	// 初始化默认显示当天tooltip的内容（使用todayData）
	const getDefaultTooltipContent = () => {
			const typeText = typeIndex === 0 ? '支出' : typeIndex === 1 ? '收入' : '结余';
			return `{date|${year}年${month}月${today}日}\n{money|${typeText}${todayData} 元}`;
	};

	const option = {
			animation: true,
			animationDuration: 1500,
			backgroundColor: "transparent",
			color: ["#ec5d5f", "#f2cb58", "#64a0c8"],

			tooltip: {
					show: true,
					trigger: 'axis',
					triggerOn: 'mousemove', // 鼠标移动触发
					confine: true,
					backgroundColor: '#f4f2f7',
					padding: [2, 6],
					borderRadius: [0, 0, 0, 0],
					textStyle: { color: '#999999', fontSize: 8 },
					shadowBlur: 0,
					shadowColor: 'transparent',
					borderWidth: 0,
					rich: {
							date: { color: '#fff', fontSize: 8, lineHeight: 0 },
							money: { color: '#ffffff', fontSize: 6, lineHeight: 0, fontFamily: 'WeChatSansStd' }
					},
					formatter: function (params) {
							// 如果是初始化默认显示，使用todayData；否则使用hover点数据
							if (params && params.length > 0) {
									return formatTooltipContent(params);
							}
							// 兜底返回当天数据
							return getDefaultTooltipContent();
					},
					position: getTooltipPosition
			},
			grid: { left: 10, top: 5, bottom: 20, right: 10, containLabel: false },
			xAxis: [{
					nameGap: 3,
					nameTextStyle: { color: "#999999", fontSize: 10 },
					type: "category",
					data: xData,
					boundaryGap: false,
					axisLine: { rotate: 0, interval: 0, lineStyle: {} },
					axisLabel: { color: "#999999", fontSize: 9, interval: 5 },
					axisTick: { show: true }
			}],
			yAxis: [{ type: 'value', show: false }],
			series: [{
					type: "line",
					smooth: true,
					lineStyle: { 
							color: typeIndex === 0 ? COLOR?.expenseColor : typeIndex === 1 ? COLOR.incomeColor : COLOR.jyColor, 
							width: 1.2 
					},
					showSymbol: true, // 显示数据点，方便hover
					symbol: "circle",
					symbolSize: 4,
					itemStyle: {
							color: "#FFF",
							borderWidth: 1,
							borderColor: typeIndex === 0 ? COLOR?.expenseColor : typeIndex === 1 ? COLOR.incomeColor : COLOR.jyColor
					},
					areaStyle: {
							normal: {
									color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
											offset: 0, 
											color: typeIndex === 0 ? COLOR?.expenseColor : typeIndex === 1 ? COLOR.incomeColor : COLOR.jyColor
									}, { 
											offset: 1, 
											color: '#ffffff' 
									}], false)
							}
					},
					emphasis: { focus: "series" },
					data: yData,
					triggerEvent: true // 开启事件触发，确保hover/点击正常
			}]
	};

	// 挂载初始化相关数据（用于外部调用显示当天tooltip）
	option.todayIndex = todayIndex;
	option.todayData = todayData; // 利用todayData
	option.maxExpenseIndex = maxExpenseIndex;
	option.maxExpenseValue = maxExpenseValue;
	option.defaultTooltipContent = getDefaultTooltipContent(); // 提供默认tooltip内容

	// 初始化完成后显示当天tooltip的方法
	this.showTodayTooltip = () => {
			if (this.echartsComponnetLine && this.echartsComponnetLine.getChart) {
					const chart = this.echartsComponnetLine.getChart();
					// 触发当天索引的tooltip显示
					chart.dispatchAction({
							type: 'showTip',
							seriesIndex: 0,
							dataIndex: todayIndex,
							position: getTooltipPosition(
									chart.convertToPixel({ seriesIndex: 0 }, [todayIndex, todayData]),
									[{ chart, data: todayData, axisValue: `${today}日` }],
									null,
									null,
									{ contentSize: [80, 30] }
							)
					});
			}
	};

	return option;
},
	getPie(data) {
		let { typeIndex } = this.data
		// 冷色调数组（绿/青/蓝/紫/浅灰蓝，无相近色，层层递进）
		let typeIndexGrColors = [
			COLOR.expenseColor,
			'#39A0DC', // 深海蓝（加深版主色）
			'#2979BF', // 藏青蓝（沉稳冷蓝）
			'#6C63FF', // 冷调浅紫
			'#5248D2', // 深紫蓝（紫蓝融合）
			'#9575CD', // 紫罗兰（冷调紫）
			'#808BC9', // 灰紫蓝（低饱和冷紫）
			'#82B1FF', // 淡天蓝（清新冷蓝）
			'#5C6BC0', // 冷调靛蓝
			'#80DEEA', // 薄荷青（低饱和冷青）
			'#4DD0E1', // 湖蓝青（鲜亮冷青）
			'#26C6DA', // 青蓝（冷调青）
			'#B2EBF2', // 极浅青蓝（背景级冷色）
			'#9FA8DA', // 淡灰蓝（中性冷灰）
			'#B39DDB', // 浅藕紫（低饱和冷紫）
			'#B0BEC5', // 冷调浅灰（中性色）
			'#78909C', // 深冷灰（辅助色）
			'#CFD8DC', // 极浅冷灰（边框/背景）
			'#42A5F5'  // 亮天蓝（点缀色）
	];

	let typeIndexReColors = [
   COLOR.incomeColor,
    '#E55555', // 砖红
    '#FF8A65', // 橘红
    '#E64A19', // 铁锈橙红
    '#FFB74D', // 暖橙黄
    '#F57C00', // 焦糖橙
    '#FF5C8A', // 玫粉橙
    '#D84315', // 深砖红
    '#FFAB91', // 浅橙粉
    '#FBC02D', // 暖黄
    '#FF9800', // 亮橙
    '#D32F2F', // 暗红
    '#E91E63', // 洋红
    '#C71585', // 深洋红
    '#FFCCBC', // 浅橘粉
    '#FFE0B2', // 奶油橙黄
    '#FFD740', // 金黄
    '#E65100', // 深焦糖色
    '#BF360C', // 深棕红
    '#FF7043', // 浅焦糖红
    '#FFCA28', // 亮黄橙
    '#F4511E', // 暗橙红
    '#E0F2F1'  // 极浅暖白（背景填充）
];

		// 暖色调2（黄/橙/橘/焦糖/浅棕系，无相近色，暖调核心）
		let typeIndexYeColors = [
	COLOR.jyColor,
			'#FF9800', // 亮橙
			'#FF7043', // 橘红橙
			'#F57C00', // 深橙
			'#FFD54F', // 柠檬黄（暖调）
			'#FBC02D', // 蛋黄
			'#F5A623', // 暗金黄
			'#E67C22', // 焦糖橙
			'#D48806', // 土黄
			'#FFE082', // 奶油黄
			'#FFCC80', // 浅橙黄
			'#8D6E63', // 浅棕（暖调）
			'#A1887F', // 豆沙棕
			'#FFAB40', // 亮橘黄
			'#FF9100', // 深橘
			'#FFE485', // 极浅黄
			'#FFCA28', // 亮黄
			'#E49B0F', // 暗橙黄
			'#C06C84'  // 暖调浅棕粉
		];
		// 核心优化1：无数据兜底逻辑
		const isEmptyData = !data || data.length === 0 || (data.length === 1 && !data[0].value && !data[0].c);
		// 无数据时使用默认灰色占位数据
		const renderData = isEmptyData ? [{
			name: '暂无数据',
			value: 100,
			itemStyle: {
				color: '#e5e5e5' // 无数据默认灰色
			},
			label: {
				show: false,
				formatter: '暂无数据',
				color: '#999',
				fontSize: 12
			},
			labelLine: {
				show: false // 无数据时隐藏引导线
			}
		}] : data;

		// 核心优化2：根据数据量动态调整动画配置
		const dataLength = renderData.length;
		const isLargeData = dataLength > 10;

		let option = {
			color: typeIndex == 0 ? typeIndexGrColors : typeIndex == 1 ? typeIndexReColors : typeIndexYeColors,
			// 核心优化3：动态调整动画参数（无数据时缩短动画）
			animation: true,
			animationDuration: isEmptyData ? 1000 : (isLargeData ? 2000 : 5000),
			animationEasing: isEmptyData ? "linear" : (isLargeData ? "linear" : "bounceOut"),
			animationThreshold: isLargeData ? 20 : 8,
			animationDurationUpdate: isLargeData ? 1000 : 3000,
			animationDelay: function (idx) {
				return idx * 20;
			},
			// 新增：无数据时的全局样式兜底
			backgroundColor: 'transparent',
			// 提示框：无数据时隐藏tooltip
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
				},
			toolbox: {
				show: !isEmptyData, // 无数据时隐藏工具栏
				feature: {},
			},
			series: [{
				minAngle: isEmptyData ? 360 : 5, // 无数据时饼图占满整个圆
				avoidLabelOverlap: true,
				labelLine: {
					minTurnAngle: 30,
					length: 15,
					length2: 20,
					smooth: 0.2,
					showAbove: true,
					lineStyle: {
						width: 1,
						color: '#ccc'
					}
				},
				type: "pie",
				radius: [50, 80],
				center: ["50%", "50%"],
				itemStyle: {
					borderRadius: 0,
					borderColor: '#fff',
					borderWidth: 0
				},
				label: {
					show: !isEmptyData, // 无数据时使用自定义label，关闭默认label
					position: "outside",
					formatter: '{b}: {c} ({d}%)',
					color: '#999999',
					fontSize: 9,
					distance: 20,
					rotate: 0,
					alignTo: 'labelLine',
					overflow: 'break',
					silent: false
				},
				data: renderData // 使用兜底后的渲染数据
			}],
			// 防止标签超出画布
			graphic: {
				elements: []
			}
		};
		return option
	},
	/**
		* 切换tab
		*/
	handleChange(evt) {
		let { sub } = evt.detail.delta
		this.setData({
			typeIndex: sub,
			isPieExpand: false,
			isLineExpand: false
		})
		let token = getStorageSync("token")
		if (!token) return
		this.getChartData(sub)
	},
	/**
 * 处理弹窗显示 子组件传递
 * @param {Event} evt - 事件对象
 */
	handleChildPopup(data: any) {
		let { delta, type } = data.detail
		// const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作
		// 封装更新弹窗状态的方法
		this.updatePopupStatus(type, !delta);
	},
	handlePopup(evt) {
		const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作
		// 封装更新弹窗状态的方法
		this.updatePopupStatus(type, true);
	},

	/**
	 * 处理弹窗关闭
	 */
	handleCloseOverlay() {
		const { popupType } = this.data;
		if (!popupType) return; // 增加空值校验
		this.updatePopupStatus(popupType, false);
	},

	/**
	 * 统一更新弹窗状态的方法
	 * @param {string} type - 弹窗类型
	 * @param {boolean} show - 是否显示弹窗
	 */
	updatePopupStatus(type, show) {
		const key = `showPopup_${type}`;
		const data = {
			[key]: show
		};
		// 如果是显示弹窗，同时记录当前弹窗类型
		if (show) {
			data.popupType = type;
		}
		this.setData(data);
	},
	/**
 * 选择周期
 */
	handleCycle(evt) {
		let { xx, title } = evt.currentTarget.dataset
		this.setData({
			showPopup_date: false
		})
	},
	/**
	 * 选择范围
	 * @param evt 
	 */
	handleRange(evt) {
		let { xx, title } = evt.currentTarget.dataset
		this.setData({
			showPopup_date: false
		})
	},
	/**
 * 切换折叠/展开状态 折线图
 */
	toggleLineExpand() {
		wx.vibrateShort({ type: 'heavy' })
		this.setData({
			isLineExpand: !this.data.isLineExpand
		});
	},
	/**
* 切换折叠/展开状态 环形图
*/
	togglePieExpand() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		this.setData({
			isPieExpand: !this.data.isPieExpand,
		});
	},
	/**
	 * 跳转到日期账单列表
	 */
	handleDatePage(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		let { typeIndex } = this.data
		let bookInfo = getStorageSync("bookInfo")
		let userInfo = getStorageSync("userInfo")
		let transactionType = typeIndex == 0 ? 2 : typeIndex == 1 ? 1 : 100
		let { date, category_id, category_name,title } = evt.currentTarget.dataset
		// console.log(evt.currentTarget.dataset)
		let url = "/subPackages/pages/transaction/date/index?start_time=" + date + '&type=' + transactionType + '&bookId=' + bookInfo.id + '&userId=' + userInfo.id + '&categoryId=' + category_id + '&categoryName=' + category_name + '&title='+title

		console.log(url)
		// return
		wx.navigateTo({
			url,
			routeType: "wx://upwards"
		})
	},
})