// subPackages/pages/transaction/export/index.ts
import { COLOR } from '../../../../utils/color.js';
import {getStorageSync} from '../../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBgColor: COLOR.white,
		level_exp:0
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
		let userInfo = getStorageSync("userInfo")
		console.log(userInfo)
		this.setData({
			level_exp:userInfo.levelInfo.user_level_exp
		})
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