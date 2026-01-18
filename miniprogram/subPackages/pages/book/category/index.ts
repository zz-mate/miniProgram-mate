// subPackages/pages/book/category/index.ts

const app = getApp()
import { getStorageSync } from '../../../../utils/util';
import { getBookCagetgoryList } from '../../../../api/book'
import { playBtnAudio } from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		bookCategoryList: []
	},
	/**
	 * 账本分类列表
	 */
	async getBookCategoryList() {
		let token = getStorageSync("token")
		if (!token) return
		let res = await getBookCagetgoryList()
		let list = res.list


		this.setData({
			bookCategoryList: list
		})
	},
	handleBookSelected(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let userInfo = getStorageSync("userInfo")
		const { item } = evt.currentTarget.dataset
		let params = `bookCategoryId=${item.id}&icon=${item.icon}&name=${item.name}&userId=${userInfo.id}`
		wx.navigateTo({
			url: `/subPackages/pages/book/add/index?${params}`
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.getBookCategoryList()
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