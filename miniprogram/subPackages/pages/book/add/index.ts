// subPackages/pages/book/add/index.ts
import { COLOR } from '../../../../utils/color.js';
import { createBook, updateBook } from '../../../../api/book'
import { playBtnAudio } from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		params: {
			userId: "", bookCategoryId: "", icon: '', description: "", name: ""
		}
	},
	bindKeyInput: function (e) {
		this.setData({
			'params.name': e.detail.value
		})
	},
	async handleBookSave() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);

		const notify = this.selectComponent('#customNotify');
		let { params } = this.data

		if (params.name == '' || params.name.trim() == "") {
			return wx.showToast({
				title: "请输入名称",
				icon: "none"
			})
		}
		let res = await createBook(params)
		if (res.code == 200) {
			let obj = {
				bookId: res.data.id,
				userId: params.userId,
				is_default: 1
			}
			await updateBook(obj)
			wx.switchTab({
				url: "/pages/index/index"
			})
		}else{
			notify.showNotify({
				message: res.message,
				type: 'warning',
				duration: 1500
			});
		}



	},





	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ userId, bookCategoryId, icon = '', name }) {
		this.setData({
			'params.userId': userId,
			'params.bookCategoryId': bookCategoryId,
			'params.icon': icon,
			'params.name': name,
		})

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