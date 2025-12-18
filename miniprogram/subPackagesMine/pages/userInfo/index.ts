// subPackagesMine/pages/userInfo/index.ts
import { getStorageSync } from '../../../utils/util';
import { COLOR } from '../../../utils/color.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.theme,
    height: app.globalData.systemInfo.autoheight + 70,
    userInfo: null
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: "温馨提示",
      content: "确认退出当前账号吗？",
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.reLaunch({
            url: "/pages/home/index"
          })
        }

      }
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
      userInfo: getStorageSync("userInfo")
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