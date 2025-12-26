// subPackages/pages/book/add/index.ts
import { COLOR } from '../../../../utils/color.js';
import { createBook,updateBook } from '../../../../api/book'

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

		wx.vibrateShort({ type: 'heavy' })

		

		let { params } = this.data

		if(params.name==''||params.name.trim()==""){
			return wx.showToast({
				title:"请输入名称",
				icon:"none"
			})
		}
		let res = await createBook(params)
		console.log(res.data)
		if(res.code==200){
			let obj={
				bookId: res.data.id,
				userId: params.userId,
				is_default: 1
			}
	 await updateBook(obj)
			wx.switchTab({
				url:"/pages/index/index"
			})
		}



	},





	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ userId, bookCategoryId, icon = '', description }) {
		this.setData({
			'params.userId': userId,
			'params.bookCategoryId': bookCategoryId,
			'params.icon': icon,
			'params.description': description,
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