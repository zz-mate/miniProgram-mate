// subPackagesMine/pages/qrcode/index.ts
import { COLOR } from '../../../../../utils/color.js';
import { generateCode, validateQrCode } from '../../../../../api/book'
import { getStorageSync, setStorageSync } from '../../../../../utils/util';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		qrcode: "",
		id: '',
		bookUuid:'',
		userInfo: null,
		expireTime: ''
	},
	async validateQrCode(shareUuid) {
		let data = {
			shareUuid
		}
		let res = await validateQrCode(data)
		console.log(res)
		if (!res.isValid) {
			this.generateUserQRCodeFn()
		}
	},
	async generateUserQRCodeFn() {
		let data = {
			inviterUserId: getStorageSync("userInfo").id,
			bookId: Number(this.data.id),
			bookUuid:this.data.bookUuid
		}
		let res = await generateCode(data)
		setStorageSync("shareUuid", res.data.shareUuid)
		this.setData({
			qrcode: res.data.qrCodeImage, expireTime: res.data.expireTime,
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ id ,bookUuid}) {
		this.setData({ id,bookUuid })
		let shareUuid = getStorageSync("shareUuid")
		if (shareUuid) {
			this.validateQrCode(shareUuid)
		} else {
			this.generateUserQRCodeFn()
		}

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