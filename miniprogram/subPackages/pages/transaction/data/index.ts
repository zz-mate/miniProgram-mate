// subPackages/pages/transaction/data/index.ts
import { getStorageSync } from '../../../../utils/util';
import { getFilter_date } from '../../../../api/statement'
import SystemConfig from '../../../../utils/capsule';
import { COLOR } from '../../../../utils/color.js';
import * as echarts from '../../../../components/ec-canvas/echarts';

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		start_time:"",
		popupType: '',
		showPopup_date: false,
		navBarHeight: 0,
		statusBarHeight: 0,
		filterHeight: 0,
		padding: [0, 16, 0, 16],

		cycleList: [{ "xx": 'xx', title: "年" }, { "xx": 'xx', title: "季" }, { "xx": 'xx', title: "月" }, { "xx": 'xx', title: "周" }, { "xx": 'xx', title: "日" }],
		rangeList: [{ "xx": 'xx', title: "近1年" }, { "xx": 'xx', title: "近30天" }, { "xx": 'xx', title: "近7天" }, { "xx": 'xx', title: "自定义" }],

		navBgColor: COLOR.white,
		redClor: COLOR.error,
		greenClor: COLOR.success,
		yellowClor: COLOR.warning,
		isLineExpand: false,
		isPieExpand: false,
		queryParams: {
			timeType: '',
			year: '2025',
			month: '12'
		},
		typeList: [{ color: COLOR.success, name: '支出' }, { color: COLOR.error, name: '收入' }, { color: COLOR.warning, name: '结余' }],
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
		let data = {
			"userId": userInfo.user_id,
			...this.data.queryParams,
			transactionType: typeIndex == 0 ? 2 : typeIndex == 1 ? 1 : 100
		}
		let res = await getFilter_date(data)
		this.setData({
			chartData: res.data
		})


		this.echartsComponnetLine = this.selectComponent('#mychart-dom-line');
		// 传入类型标识 'line'，指定获取折线图配置
		this.getData('echartsComponnetLine', 'line');
		this.echartsComponnetpie = this.selectComponent('#mychart-dom-pie');
		// 传入类型标识 'pie'，指定获取饼图配置
		this.getData('echartsComponnetpie', 'pie');


	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function ({date}) {
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

		this.setData({
			navBarHeight: capsuleConfig.navBarHeight,
			statusBarHeight: capsuleConfig.statusBarHeight,
			start_time:date
		});

	},
	onShow() {
		let { typeIndex } = this.data
		let token = getStorageSync("token")
		if(!token) return
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
		let { lineData, PieData } = this.data.chartData
		console.log(lineData,123)
		// 根据传入的类型返回对应配置
		if (chartType === 'line') {
			return this.getLine(lineData.xData, lineData.xAxisData);
		} else if (chartType === 'pie') {
			return this.getPie(PieData.summary.detailList);
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
console.log(xData,yData)
		return this.getLine(xData, yData);
	},

	/**
	 * 获取数据
	 */
	getLine(xData, yData,) {
		let { year, month } = this.data.queryParams;
		let { typeIndex } = this.data
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
			let finalX = 0;
			let finalY = 0;
			const validMaxIndex = typeof maxExpenseIndex === 'number' && maxExpenseIndex >= 0 ? maxExpenseIndex : 0;
			const validMaxValue = typeof maxExpenseValue === 'number' ? maxExpenseValue : 0;
			const maxPointPos = chart.convertToPixel({ seriesIndex: 0 }, [validMaxIndex, validMaxValue]);

			// 所有点的垂直位置都固定在最大值上方，水平跟随当前点
			finalX = pos[0] - size.contentSize[0] / 2; // 水平居中当前hover点
			finalY = maxPointPos[1] - size.contentSize[1] - 10; // 垂直固定最上方

			return [finalX, finalY];
		};

		let option = {
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
				// 核心修复：formatter接收params参数，显示当前hover点的内容
				formatter: function (params) {
					// params是当前hover点的数据源，从中提取日期和数值
					const currentDay = params[0].axisValue.replace('日', ''); // 当前hover的日期
					const currentValue = params[0].data || 0; // 当前hover的数值
					const showYear = year || new Date().getFullYear();
					const showMonth = month || (new Date().getMonth() + 1);
					// 返回当前hover点的内容（不再固定当天）
					return `{date|${showYear}年${showMonth}月${currentDay}日}\n{money|${typeIndex == 0 ? '支出' : typeIndex == 1 ? '收入' : '结余'}${currentValue} 元}`;
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
				lineStyle: { color: typeIndex == 0 ? COLOR?.success : typeIndex == 1 ? COLOR.error : COLOR.warning, width: 1.2 },
				showSymbol: false, // 显示数据点，方便hover
				symbol: "circle",
				symbolSize: 4,
				itemStyle: {
					color: "#FFF",
					borderWidth: 1,
					borderColor: typeIndex == 0 ? COLOR?.success : typeIndex == 1 ? COLOR.error : COLOR.warning
				},
				areaStyle: {
					normal: {
						color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
							offset: 0, color: typeIndex == 0 ? COLOR?.success : typeIndex == 1 ? COLOR.error : COLOR.warning
						}, { offset: 1, color: '#ffffff' }], false)
					}
				},
				emphasis: { focus: "series" },
				data: yData,
				triggerEvent: true // 开启事件触发，确保hover/点击正常
			}]
		};

		// 挂载当天索引（用于初始化默认显示当天tooltip）
		option.todayIndex = todayIndex;
		option.maxExpenseIndex = maxExpenseIndex;
		option.maxExpenseValue = maxExpenseValue;
		return option;
	},
	getPie(data) {
		let { typeIndex } = this.data
	// 冷色调数组（绿/青/蓝/紫/浅灰蓝，无相近色，层层递进）
let typeIndexGrColors = [
	COLOR.success, // 基础主绿（冷调草绿）
	'#4AB898', // 冷调青柠绿
	'#38A194', // 冷调墨绿
	'#5BC0EB', // 天青蓝（冷调核心）
	'#39A0DC', // 深海蓝
	'#6C63FF', // 冷调浅紫
	'#5248D2', // 深紫蓝
	'#9FA8DA', // 淡灰蓝
	'#808BC9', // 灰紫蓝
	'#B2EBF2', // 极浅青蓝
	'#80DEEA', // 薄荷青
	'#4DD0E1', // 湖蓝青
	'#B39DDB', // 浅藕紫
	'#9575CD', // 紫罗兰
	'#A7FFEB', // 冰湖绿
	'#64FFDA', // 冷调翡翠绿
	'#E0F7FA', // 极浅冰蓝
	'#B0BEC5', // 冷调浅灰
	'#82B1FF', // 淡天蓝
	'#5C6BC0'  // 冷调靛蓝
];

// 暖色调1（红/粉/玫红/砖红系，无相近色，区分度高）
let typeIndexReColors = [
	COLOR.error, // 基础主红（暖调正红）
	'#FF6B6B', // 亮珊瑚红
	'#E55555', // 砖红
	'#FF8FA3', // 浅粉桃（暖调）
	'#FF5C8A', // 玫粉色
	'#F06292', // 豆沙粉
	'#D81B60', // 酒红玫
	'#C2185B', // 深玫红
	'#FFAB91', // 浅橙粉
	'#FF8A65', // 橘粉色
	'#E64A19', // 铁锈红
	'#D84315', // 深砖红
	'#FCE4EC', // 极浅粉
	'#F8BBD0', // 淡粉紫
	'#EC407A', // 亮玫红
	'#D32F2F', // 暗红
	'#FFE0E9', // 奶油粉
	'#FFCCBC', // 浅橘粉
	'#E91E63', // 洋红
	'#C71585'  // 深洋红
];

// 暖色调2（黄/橙/橘/焦糖/浅棕系，无相近色，暖调核心）
let typeIndexYeColors = [
	COLOR.warning, // 基础主黄（暖调金黄）
	'#FFB74D', // 浅橘黄
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
		if(!token) return
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
		this.setData({
			isLineExpand: !this.data.isLineExpand
		});
	},
	/**
* 切换折叠/展开状态 环形图
*/
	togglePieExpand() {
		this.setData({
			isPieExpand: !this.data.isPieExpand,
		});
	},
	/**
	 * 跳转到日期账单列表
	 */
	handleDatePage(evt) {
		wx.vibrateShort({ type: 'heavy' })
		let { typeIndex } = this.data
		let bookInfo = getStorageSync("bookInfo")
		let userInfo = getStorageSync("userInfo")
		let transactionType = typeIndex == 0 ? 2 : 1
		console.log(evt.currentTarget.dataset)
		let { date,category_id,category_name } = evt.currentTarget.dataset
		console.log(evt.currentTarget.dataset)
		let url =  "/subPackages/pages/transaction/date/index?date=" + date + '&transactionType=' + transactionType + '&bookId=' + bookInfo.book_id + '&userId=' + userInfo.user_id

		wx.navigateTo({
			url: category_id ? url +='&categoryId='+category_id+'&categoryName='+category_name:url,
			routeType: "wx://upwards"
		})
	}
})