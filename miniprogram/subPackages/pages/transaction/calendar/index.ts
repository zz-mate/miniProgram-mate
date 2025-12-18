// subPackages/pages/transaction/calendar/index.ts
import { getStorageSync, getThisDate } from '../../../../utils/util';
import { COLOR } from '../../../../utils/color.js';
import { getTransactionList, filterDateTransaction } from '../../../../api/transaction'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		queryParams: {
			year: '',
			month: '',
			page: 1,
			pageSize: 100,
		},
		calendarDate: '',
		dailySummary: [],
		transactionList: []
	},
	/**
	 * 流水列表
	 */
	async handleTransactionList() {
		let data = {
			userId: getStorageSync("userInfo").id,
			bookId: getStorageSync("bookInfo").id,
			...this.data.queryParams
		}

		let res: any = await getTransactionList(data)
		this.setData({
			dailySummary: res.dailySummary,
			total: res.pagination.total,
			totalPages: res.pagination.totalPages
		})
		const calendar = this.selectComponent('#calendar');
		if (calendar) {
			calendar.createDays(this.data.queryParams.year, this.data.queryParams.month);
		}
		let deta = {
			detail: getThisDate('YY-MM-DD')
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
		let date = this.formatDateStr(e.detail)

		let userInfo = getStorageSync("userInfo")
		this.getCalenderBillList(userInfo.id, date)
	},
	async getCalenderBillList(userId: number, date: string) {
		let res = await filterDateTransaction({ userId, date })

		this.setData({
			transactionList: res.data.list,
			totalIncome:res.data.totalIncome,
			totalExpense:res.data.totalExpense,
			calendarDate: date
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
		let date = getThisDate('YY-MM')
		const dateStr = date.split("-")
		this.setData({
			'queryParams.year': dateStr[0],
			'queryParams.month': dateStr[1]
		})
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