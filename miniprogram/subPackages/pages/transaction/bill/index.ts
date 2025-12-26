// subPackages/pages/transaction/bill/index.ts
import { COLOR } from '../../../../utils/color.js';
import { getStorageSync, getThisDate, formatCurrentTime, generateYearGroupList, findYearIndex, generateYearMonthNestedList, findYearMonthInNestedList } from '../../../../utils/util';
import { getTransactionList } from '../../../../api/transaction'
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';

let startYear = 1970
let endYear = 2100

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scrollHeight: 0,
		navBgColor: COLOR.white,
		yearMonthMoreActive: 0,
		tabsList: [{ id: 1, name: "全部" }, { id: 2, name: "年" }, { id: 3, name: "月" }],
		queryParams: {
			start_time: "" as string,
			end_time: "" as string,
			page: 1,
			pageSize: 100,
		},
		total: 0,
		startDate: 0,
		endDate: 0,
		typeIndex: 0,
		transactionList: [],
		summary: null,

		popupType: "",
		showPopup_year: false,
		showPopup_month: false,
		yearList: generateYearGroupList({ startYear, endYear, groupSize: 10 }),
		// groupIndex: 0,
		groupYearIndex: 0,
		groupMonthIndex: 0,
		isDataYReady: false,// 没有用
		isDataMReady: false,// 没有用
		monthList: generateYearMonthNestedList({
			startYear,
			endYear,
			startMonth: 1,
			endMonth: 12
		}),
		MonthLen: 0,
		split_year: '',
		split_month: '',
		chooseYearDate:getThisDate('YY')+'-'+getThisDate("M")
	},
	/**点击TAB 默认日期 */
	handleChange(evt) {
		const { sub } = evt.detail.delta
		wx.vibrateShort({ type: 'heavy' })
		if (sub == 0) {
			this.setData({
				'queryParams.start_time': '',
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			})
		}
		else if (sub == 1) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY"),
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			})
		} else if (sub == 2) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY-MM"),
				'queryParams.end_time': '',
				split_year: getThisDate('YY'),
				split_month: getThisDate('MM'),
			})
		}

		this.setData({
			yearMonthMoreActive: sub
		})
		const { typeIndex } = this.data
		let type_idx = typeIndex == 0 ? '' : typeIndex == 1 ? 2 : 1
		this.handleTransactionList(type_idx)

	},
	async handleTransactionList(type) {
		let data = {
			userId: getStorageSync("userInfo").id,
			bookId: getStorageSync("bookInfo").id,
			...this.data.queryParams,
			type
		}

		let res: any = await getTransactionList(data)
		// const { yearMonthMoreActive } = this.data

		// let start_time = ''
		// let end_time = ''
		// // let startDate = ''
		// if (yearMonthMoreActive == 0) {
		// 	start_time = res.list.timeRange.start
		// 	end_time = res.list.timeRange.end
		// 	// startDate	dateUtils.formatToTimestamp(res.list.timeRange.start, '-')
		// } else if (yearMonthMoreActive == 1) {
		// 	start_time = res.list.year
		// } else if (yearMonthMoreActive == 2) {
		// 	start_time = `${res.list.year}-${res.list.month}`
		// }


		this.setData({
			transactionList: res.list.dataList || [],
			dailySummary: res.dailySummary,
			summary: res.summary,
			'queryParams.page': res.pagination.page,
			'queryParams.pageSize': res.pagination.pageSize,
			// 'queryParams.start_time':start_time,
			// 'queryParams.end_time': end_time,
			// startDate: res.list.timeRange?.start ? dateUtils.formatToTimestamp(res.list.timeRange.start, '-') : (res.list.year),
			// endDate: type ? dateUtils.formatToTimestamp(res.list.timeRange.end, '-') : '',
			total: res.pagination.total,
			totalPages: res.pagination.totalPages
		})
		// console.log(dateUtils.formatToTimestamp(res.list.timeRange.start,'-'))
		// const calendar = this.selectComponent('#calendar');
		// if (calendar) {
		// 	calendar.createDays(2025, 12);
		// }
	},
	handleTabType(evt) {
		wx.vibrateShort({ type: 'heavy' })
		const { type } = evt.currentTarget.dataset
		this.setData({
			typeIndex: type
		})
		let type_idx = type == 0 ? '' : type == 1 ? 2 : 1
		this.handleTransactionList(type_idx)
	},






	// 获取导航栏高度
	getScrollHeight() {
		const query = wx.createSelectorQuery();
		query.select('.nav-bar').boundingClientRect();
		query.select('.filter-date').boundingClientRect();
		query.select('.bill-card').boundingClientRect();
		query.select('.bill-item_header').boundingClientRect();
		query.exec((res) => {
			if (res) {
				this.setData({
					scrollHeight: res[0].height + res[1].height + res[2].height + res[3].height,
				});
			}
		})

	},
	handleBillDataPage(evt) {
		const { date,name } = evt.currentTarget.dataset
		const { typeIndex } = this.data
		let bookInfo = getStorageSync("bookInfo")
		let userInfo = getStorageSync("userInfo")
		wx.vibrateShort({ type: 'heavy' })
		wx.showActionSheet({
			itemList: ['趋势统计', '账单明细'],
			success (res) {
				wx.vibrateShort({ type: 'heavy' })
				if(res.tapIndex==0){
wx.navigateTo({
			url: `/subPackages/pages/transaction/data/index?date=${date}&typeIndex=${typeIndex}&title=${name}`
		})
				}else{
					let url = "/subPackages/pages/transaction/date/index?start_time=" + date + '&type=' + 100 + '&bookId=' + bookInfo.id + '&userId=' + userInfo.id + '&categoryId=' + undefined + '&categoryName=' + undefined + '&title='+name
					wx.navigateTo({
						url
					})
				}
			
			},
			fail (res) {
				console.log(res.errMsg)
			}
		})
		
		
	},


	handleYear(evt) {
		wx.vibrateShort({ type: 'heavy' })
		this.setData({
			'queryParams.start_time': evt.currentTarget.dataset.year
		})
		let type_idx = this.data.typeIndex == 0 ? '' : this.data.typeIndex == 1 ? 2 : 1
		this.handleTransactionList(type_idx)
	},

	changeMonth(evt) {
		wx.vibrateShort({ type: 'heavy' })
		const { current } = evt.detail
		this.setData({
			groupMonthIndex: current,
			'queryParams.start_time': this.data.monthList[current][0].year,
			split_year: this.data.monthList[current][0].year,
			
		})
	},

	handleMonth(evt) {
		wx.vibrateShort({ type: 'heavy' })
		let split_month = evt.currentTarget.dataset.month
		let { split_year } = this.data
		let month = split_month < 10 ? '0' + split_month : split_month

		this.setData({
			'queryParams.start_time': split_year + '-' + month,
			split_month: evt.currentTarget.dataset.month,
			chooseYearDate:split_year+'-'+split_month
		})
		let type_idx = this.data.typeIndex == 0 ? '' : this.data.typeIndex == 1 ? 2 : 1
		this.handleTransactionList(type_idx)
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
	handlePopup() {
		wx.vibrateShort({ type: 'heavy' })
		const yearMonthMoreActive = this.data.yearMonthMoreActive
		let type = ''
		switch (yearMonthMoreActive) {
			case 1:
				type = 'year';
				break; // 必须加break，否则会执行case 2的逻辑
			case 2:
				type = 'month';
				break;
			default:
				type = ''; // 兜底，避免type为undefined
				break;
		}
		if (!type) return; // 增加类型校验，避免空值操作
		console.log(type)
		if (type == 'year') {
			let yearIndexInfo = findYearIndex({ targetYear: Number(this.data.queryParams.start_time), yearGroupList: this.data.yearList })
			console.log(yearIndexInfo)
			this.setData({
				groupYearIndex: yearIndexInfo.groupIndex,
				isDataYReady: true,
				'queryParams.start_time': this.data.yearList[yearIndexInfo.groupIndex][yearIndexInfo.innerIndex]
			})
			console.log(this.data.yearList[yearIndexInfo.groupIndex][yearIndexInfo.innerIndex])
		} else if (type == 'month') {
			let { start_time } = this.data.queryParams

			let monthIndexInfo = findYearMonthInNestedList({ targetYear: Number(start_time.split('-')[0]), targetMonth: Number(start_time.split('-')[1]), yearMonthNestedList: this.data.monthList })
			console.log(monthIndexInfo)
			this.setData({
				split_month: start_time.split('-')[1],
				split_year: start_time.split('-')[0],
				// 'queryParams.start_time':
				groupMonthIndex: monthIndexInfo.yearGroupIndex,
				// MonthLen
				isDataMReady:true
			})
		}
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
		const key = `${POPUP_SHOW_KEY_PREFIX}${type}`;
		const data = {
			[key]: show
		};

		if (type == 'month') {
			let { queryParams, split_year, split_month ,chooseYearDate} = this.data

			if (queryParams.start_time.length == 4) {
				let yy = chooseYearDate.split('-')[0]
				let mm = chooseYearDate.split('-')[1]
				let m = mm<10?'0'+mm:mm
				this.setData({
					'queryParams.start_time': yy + '-' + m
				})
			}
		}
		// 如果是显示弹窗，同时记录当前弹窗类型
		if (show) {
			data.popupType = type;
		}
		this.setData(data);
	},







	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ date, type }) {
		this.getScrollHeight()

		this.setData({
			'queryParams.start_time': typeof (date) == 'undefined' ? type : date,
			yearMonthMoreActive: typeof (date) == 'undefined' ? 1 : 2,
			// yearIndex: findYearIndex({ targetYear: type, yearGroupList:this.data.yearList})
		})

		this.handleTransactionList('')
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})