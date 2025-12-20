// subPackages/pages/transaction/calendar/index.ts
import { getStorageSync, getThisDate } from '../../../../utils/util';
import { COLOR } from '../../../../utils/color.js';
import { filterMonthTransaction, filterDateTransaction } from '../../../../api/transaction'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		billContentHeight: 0,
		start_time:"",
		calendarDate: getThisDate('YY-MM-DD'),
		dailyList: [],
		transactionList: [],
		hasData: true,
		spot: []
	},
	dateChange(e) {
		wx.vibrateShort({ type: 'heavy' })
		let dateString = e.detail.dateString
		// const year = dateString.split('-')[0];
		// const month = dateString.split('-')[1];
		// const day = dateString.split('-')[2];
		this.setData({
		  start_time: dateString
		})

		this.handleTransactionList()
	},
	/**
	 * 流水列表
	 */
	async handleTransactionList() {
		let {start_time} = this.data
		const year = start_time.split('-')[0];
		const month = start_time.split('-')[1];

		let data = {
			userId: getStorageSync("userInfo").id,
			bookId: getStorageSync("bookInfo").id,
			start_time:`${year}-${month}`
		}

		let res: any = await filterMonthTransaction(data)
		this.setData({
			calendarDate: getThisDate('YY-MM-DD'),
			dailyList: res.data.dailyList,
		})
		// console.log(res.data.dailyList)
		// const calendar = this.selectComponent('#calendar');
		// if (calendar) {
		// 	let result = this.data.yearAndMonth.split('-')
		// 	calendar.createDays(result[0], result[1]);
		// }
		let deta = {
			detail: start_time
		}

		this.select(deta)
	},
	formatDateStr(dateStr: string) {
		// 匹配 "2025/12/10 10:06" 格式的字符串
		const regex = /(\d{4})\/(\d{2})\/(\d{2})\s.*/;
		return dateStr.replace(regex, "$1-$2-$3");
	},
	//组件监听事件 查询本月账单
	select(e: any) {
		// wx.vibrateShort({ type: 'heavy' })
		let start_time = this.formatDateStr(e.detail)
		let userInfo = getStorageSync("userInfo")
		let bookInfo = getStorageSync("bookInfo")
		this.getCalenderBillList(userInfo.id, start_time, bookInfo.id)
	},
	async getCalenderBillList(userId: number, start_time: string, bookId: number) {
		let res = await filterDateTransaction({ userId, start_time, bookId })
		this.setData({
			transactionList: res.data.list,
			totalIncome: res.data.totalIncome,
			totalExpense: res.data.totalExpense,
			// calendarDate:this.data.yearAndMonth,
		}, () => {
			this.getBillContentHeight()
		})
	},
	// 跳转到账单详情页面
	handleTransactionInfo(evt) {
		const { transaction_id, transaction_type } = evt.currentTarget.dataset
		wx.vibrateShort({ type: 'heavy' })
		wx.navigateTo({
			url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
		})
	},



	getBillContentHeight() {
		const query = wx.createSelectorQuery();
		query.select('.nav-bar').boundingClientRect();
		query.select('.calendar-content').boundingClientRect();
		query.select('.bill-item_header').boundingClientRect();
		query.exec((res) => {
			if (res) {
				console.log(res)
				this.setData({
					billContentHeight: res[1].height + res[2].height + 100,
				});
				// sticky-content
			}
		})

	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {

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
		// this.setData({
		// 	'queryParams.start_time': getThisDate('YY-MM')
		// })

		this.handleTransactionList()
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