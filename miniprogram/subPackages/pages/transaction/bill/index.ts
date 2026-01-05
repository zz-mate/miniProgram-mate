// subPackages/pages/transaction/bill/index.ts
import { COLOR } from '../../../../utils/color.js';
import { playBtnAudio } from '../../../../utils/audioUtil'
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
		advHeight:0,
		type:"",
		navBgColor: COLOR.white,
		yearMonthMoreActive: 0,
		categoryId: "", bookId: "", userId: "", categoryName: "",
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
		chooseYearDate: getThisDate('YY') + '-' + getThisDate("M"),
		// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
		isJumpToDetail: false,
		// 新增标记：是否首次进入页面
		isFirstEnter: true,
	},
	/**点击TAB 默认日期 */
	handleChange(evt) {
		const { sub } = evt.detail.delta
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
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
			yearMonthMoreActive: sub,
			chooseYearDate: getThisDate('YY') + '-' + getThisDate("M")

		})
		const { typeIndex } = this.data
		let type_idx = typeIndex == 0 ? '' : typeIndex == 1 ? 2 : 1
		this.handleTransactionList(type_idx)

	},
	async handleTransactionList(type) {
		const { categoryId } = this.data
		let data = {
			userId: getStorageSync("userInfo").id,
			bookId: getStorageSync("bookInfo").id,
			...this.data.queryParams,
			type,
			categoryId
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
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
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
		query.select('.ad-card').boundingClientRect();
		
		query.exec((res) => {
			if (res) {
				console.log(res)
				let filterHeightPx = 0 || res[1].height
				this.setData({
					scrollHeight: res[0].height + filterHeightPx + res[2].height + res[3].height,
					advHeight:res[4].height+100
				});
			}
		})

	},
	handleBillDataPage(evt) {
		const { name } = evt.currentTarget.dataset
		const { typeIndex, queryParams, categoryId, categoryName } = this.data
		let bookInfo = getStorageSync("bookInfo")
		let userInfo = getStorageSync("userInfo")
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		let that = this
		wx.showActionSheet({
			itemList: ['趋势统计', '账单明细'],
			success(res) {
				wx.vibrateShort({ type: 'heavy' })
				if (res.tapIndex == 0) {
					// 跳转前标记：已跳转到详情页
					playBtnAudio('/static/audio/click.mp3', 1000);
					that.setData({
						isJumpToDetail: true
					})
					wx.navigateTo({
						url: `/subPackages/pages/transaction/data/index?date=${queryParams.start_time}&typeIndex=${typeIndex}&title=${name}`
					})
				} else {
					playBtnAudio('/static/audio/click.mp3', 1000);
					// 跳转前标记：已跳转到详情页
					that.setData({
						isJumpToDetail: true
					})
					let url = "/subPackages/pages/transaction/date/index?start_time=" + queryParams.start_time + '&type=' + 100 + '&bookId=' + bookInfo.id + '&userId=' + userInfo.id + '&categoryId=' + categoryId + '&categoryName=' + categoryName + '&title=' + name
					wx.navigateTo({
						url
					})
				}

			},
			fail(res) {
				console.log(res.errMsg)
			}
		})


	},


	handleYear(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		this.setData({
			'queryParams.start_time': evt.currentTarget.dataset.year
		})
		let type_idx = this.data.typeIndex == 0 ? '' : this.data.typeIndex == 1 ? 2 : 1
		this.handleTransactionList(type_idx)
	},

	changeMonth(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		const { current } = evt.detail
		this.setData({
			groupMonthIndex: current,
			'queryParams.start_time': this.data.monthList[current][0].year,
			split_year: this.data.monthList[current][0].year,

		})
	},

	handleMonth(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		let split_month = evt.currentTarget.dataset.month
		let { split_year } = this.data
		let month = split_month < 10 ? '0' + split_month : split_month

		this.setData({
			'queryParams.start_time': split_year + '-' + month,
			split_month: evt.currentTarget.dataset.month,
			chooseYearDate: split_year + '-' + split_month
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
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
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
				isDataMReady: true
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
			let { queryParams, split_year, split_month, chooseYearDate } = this.data

			if (queryParams.start_time.length == 4) {
				let yy = chooseYearDate.split('-')[0]
				let mm = chooseYearDate.split('-')[1]
				let m = mm < 10 ? '0' + mm : mm
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





		// 跳转到账单详情页面
		handleTransactionInfo(evt) {
			const { transaction_id, transaction_type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			this.setData({
				isJumpToDetail: true
			})
			wx.navigateTo({
				url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
			})
		},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ date, yearMonthMoreActive, type, categoryId, bookId, userId, categoryName }) {
		this.getScrollHeight()
		let type_idx = Number(type) == 2 ? 1 :  Number(type)  == 1 ? 2 : 0
		this.setData({
			'queryParams.start_time': date,
			yearMonthMoreActive:Number(yearMonthMoreActive),	
			type,
			typeIndex:type_idx,
			categoryId,
			bookId,
			userId,
			categoryName,
			// 初始化标记
			isFirstEnter: true,
			isJumpToDetail: false,
			// typeIndex: Number(type), 
			// yearIndex: findYearIndex({ targetYear: type, yearGroupList:this.data.yearList})
		})
		// let type_idx = Number(type) == 2 ? 1 :  Number(type)  == 1 ? 2 : 0
		// console.log(type_idx)
		this.handleTransactionList(type)
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
		// 核心判断逻辑：
		// 1. 不是首次进入（排除onLoad后的首次onShow）
		// 2. 是从详情页返回（isJumpToDetail为true）
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
			console.log("从账单详情页返回，执行刷新")
			this.handleTransactionList(this.data.type)
			// 刷新后重置标记，避免重复刷新
			this.setData({
				isJumpToDetail: false
			})
		}
		// 首次进入后，将标记置为false（后续onShow都是非首次）
		if (this.data.isFirstEnter) {
			this.setData({
				isFirstEnter: false
			})
		}
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