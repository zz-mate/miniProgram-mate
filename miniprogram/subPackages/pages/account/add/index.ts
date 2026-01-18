// subPackages/pages/account/add/index.ts
import { COLOR } from '../../../../utils/color.js';
import { createAccount } from '../../../../api/account'
import { playBtnAudio } from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		params: {
			money:'0.00',
			userId: "", accountCategoryId: "", icon: '',  name: "",id:"",card_no:""
		}
	},
	bindKeyInputName: function (e) {
		this.setData({
			'params.name': e.detail.value
		})
	},
	bindKeyInputCard: function (e) {
		this.setData({
			'params.card_no': e.detail.value
		})
	},
	bindKeyInput: function (e) {
		this.setData({
			'params.money': e.detail.value
		})
	},
	async handleBookSave() {

		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })

		

		let { params } = this.data

		if(params.name==''||params.name.trim()==''){
			return wx.showToast({
				title:"请输入名称",
				icon:"none"
			})
		}
		if(params.money<=0){
			return wx.showToast({
				title:"请输入金额",
				icon:"none"
			})
		}
		// accountCategoryId=4&icon=http://oss-api.zz-mate.cn/uploads/2026/01/1767969136796-df2828ff-ec20-438a-afc1-3dc163741d85.png&userId=1&title=支付宝&parentId=4&id=7
		let data = {
			"userId": params.userId,
			"name": params.name,     // 账户名称（用户自定义）
			"money": params.money,   // 仅自定义的金额字段
			"accountCategoryId":Number(params.id),
			"accountParentId":Number(params.accountCategoryId),
			"icon":params.icon,
			"card_no":params.card_no,
		}
		let res = await createAccount(data)

		if(res.code==200){
			let delta = data.accountParentId==1?2:data.accountParentId==2||data.accountParentId==3||data.accountParentId==4?3:2
			wx.navigateBack({
				delta
			})
		}else{
			const notify = this.selectComponent('#customNotify');
			notify.showNotify({
				message: res.message,
				type: 'error',
				duration: 1500
			});
		}
	},





	/**
	 * 生命周期函数--监听页面加载
	 */
	// accountCategoryId=1&userId=1&title=现金
	// accountCategoryId=4&icon=http://oss-api.zz-mate.cn/uploads/2026/01/1767969136796-df2828ff-ec20-438a-afc1-3dc163741d85.png&userId=1&title=支付宝&parentId=4&id=7
	onLoad({ userId, accountCategoryId, icon,title,id }) {
		this.setData({
			title:'添加'+title,
			'params.name':title,
			'params.userId': userId,
			'params.accountCategoryId': accountCategoryId,
			'params.id':id,
			'params.icon': icon
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