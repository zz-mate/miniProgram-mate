// subPackages/pages/transaction/date/index.ts
const app = getApp()
import { filterDateTransaction, getTransactionList } from '../../../../api/transaction'
import { getStorageSync } from "../../../../utils/util"

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		height: app.globalData.systemInfo.autoheight,
		title: "",
		token: "",
		start_time: "",
		type: "",
		bookId: "",
		userId: "",
		categoryId: "",
		userInfo: null,
		transactionList: [],
		// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
		isJumpToDetail: false,
		// 新增标记：是否首次进入页面
		isFirstEnter: true,
		categoryFlag: false
	},

	/**
	 * 日期筛选账单
	 */
	async getFilterDateTransaction() {
		let { type, bookId, userId, start_time, categoryId } = this.data
		console.log(categoryId)
		let data = {
			type, bookId, userId, start_time,
			categoryId,
			"page": 1,
			"pageSize": 100
		}
		let res = await getTransactionList(data)
		this.setData({
			transactionList: res.list.dataList[0]?.children,
		})


	},

	// 跳转到账单详情页面
	handleTransactionInfo(evt) {
		wx.vibrateShort({ type: 'heavy' })
		const { transaction_id, transaction_type } = evt.currentTarget.dataset
		// 跳转前标记：已跳转到详情页
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
	onLoad({ start_time, type, bookId, userId, categoryName, categoryId,title }) {
		let userInfo = getStorageSync("userInfo")
		let token = getStorageSync("token")
		this.setData({
			title: categoryId == 'undefined' ? title : categoryName,
			start_time, type, bookId, userId, userInfo, token, categoryId,
			// 初始化标记
			isFirstEnter: true,
			isJumpToDetail: false
		})
		// 首次进入：加载数据（仅执行一次）
		this.getFilterDateTransaction()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		// 核心判断逻辑：
		// 1. 不是首次进入（排除onLoad后的首次onShow）
		// 2. 是从详情页返回（isJumpToDetail为true）
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
			console.log("从账单详情页返回，执行刷新")
			this.getFilterDateTransaction()
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
})