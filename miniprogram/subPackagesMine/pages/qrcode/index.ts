// subPackagesMine/pages/qrcode/index.ts
import { COLOR } from '../../../utils/color.js';
import {generateUserQRCode} from '../../../api/user'
import { getStorageSync } from '../../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.white,
		qrcode:"",
		userInfo:null
  },
	async generateUserQRCodeFn(){
		let data ={
			userId:getStorageSync("userInfo").id
		}
		let res = await generateUserQRCode(data)
		this.setData({
			qrcode:res.data
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
		this.setData({
			userInfo:getStorageSync("userInfo")
		})
		this.generateUserQRCodeFn()
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