// subPackages/pages/transaction/bill/index.ts
import { COLOR } from '../../../../utils/color.js';
import { getStorageSync, formatCurrentTime } from '../../../../utils/util';
import { getTransactionList } from '../../../../api/transaction'



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
		total:0,
		startDate: 0,
		endDate: 0,
		typeIndex: 0,
		transactionList: [],
		summary: null,

	},
	/**点击TAB 默认日期 */
	handleChange(evt) {
		const { sub } = evt.detail.delta
		wx.vibrateShort({ type: 'heavy' })
		if (sub == 0) {
			this.setData({
				'queryParams.start_time': '',
				'queryParams.end_time': '',
			})
		}
		else if (sub == 1) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY"),
				'queryParams.end_time': '',
			})
		} else if (sub == 2) {
			this.setData({
				'queryParams.start_time': formatCurrentTime("YYYY-MM"),
				'queryParams.end_time': '',
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
		const { yearMonthMoreActive } = this.data

		let start_time = ''
		let end_time = ''
		// let startDate = ''
		if (yearMonthMoreActive == 0) {
			start_time = res.list.timeRange.start
			end_time = res.list.timeRange.end
			// startDate	dateUtils.formatToTimestamp(res.list.timeRange.start, '-')
		} else if (yearMonthMoreActive == 1) {
			start_time = res.list.year
		} else if (yearMonthMoreActive == 2) {
			start_time = `${res.list.year}-${res.list.month}`
		}


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
	handleBillDataPage(evt){
		const {date} = evt.currentTarget.dataset
		// wx.vibrateShort({ type: 'heavy' })
		// wx.navigateTo({
		// 	url: `/subPackages/pages/transaction/data/index?date=${date}`
		// })
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.getScrollHeight()
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