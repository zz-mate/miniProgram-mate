// subPackages/pages/transaction/date/index.ts
import { filterDateTransaction } from "../../../../api/transaction"
import { formatDateCNToStandard, getStorageSync } from "../../../../utils/util"
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: "",
		token: "",
		date: "",
		transactionType: "",
		bookId: "",
		userId: "",
		categoryId: "",
		userInfo: null,
		transactionList: []
	},
	/**
	 * 日期筛选账单
	 */
	async getFilterDateTransaction() {
		let { transactionType, bookId, userId, date, categoryId } = this.data
		console.log(this.data)
		let data = {
			transactionType, bookId, userId, date: categoryId ? formatDateCNToStandard(date, "YYYY-MM") : formatDateCNToStandard(date, "YYYY-MM-DD"),
			categoryId,
			dateType:categoryId?'month':'day',
			"page": 1,
			"pageSize": 10
		}
		let res = await filterDateTransaction(data)
		this.setData({
			transactionList: res.data.list
		})
	},
	// 跳转到账单详情页面
	handleTransactionInfo(evt) {
		wx.vibrateShort({ type: 'heavy' })
		const { transaction_id, transaction_type } = evt.currentTarget.dataset
		wx.navigateTo({
			url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ date, transactionType, bookId, userId, categoryName, categoryId }) {
		let userInfo = getStorageSync("userInfo")
		let token = getStorageSync("token")
		this.setData({
			title: categoryName ? categoryName : date,
			date, transactionType, bookId, userId, userInfo, token, categoryId
		})
		this.getFilterDateTransaction()
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