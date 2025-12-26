// subPackagesMine/pages/userInfo/index.ts
import { getStorageSync,setStorageSync } from '../../../utils/util';
import { COLOR } from '../../../utils/color.js';
import {getUserById} from '../../../api/user'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.white,
    height: app.globalData.systemInfo.autoheight + 70,
    userInfo: null
  },
  /**
   * 退出登录
   */
  logout() {
		wx.vibrateShort({ type: 'heavy' })
    wx.showModal({
      title: "温馨提示",
      content: "确认退出当前账号吗？",
      success(res) {
        if (res.confirm) {
					wx.vibrateShort({ type: 'heavy' })
          wx.clearStorageSync()
          wx.switchTab({
            url: "/pages/index/index"
          })
        }
      }
    })
  },
	getUserInfo(){
		let token = getStorageSync("token")
		if (!token) {
			this.setData({
				userInfo: null
			})
			return
		}
		let userInfo = getStorageSync("userInfo")

		getUserById({ userId: userInfo.id }).then((res) => {
			setStorageSync('userInfo', res.data);
			this.setData({
				userInfo: res.data
			})
		})
	},
	handlePageUrl(evt) {
		const { url, type,value} = evt.currentTarget.dataset
		wx.vibrateShort({ type: 'heavy' })
		console.log(url,type)
		// if (type == 'page') {
			wx.navigateTo({ url:url+'?type='+type +'&value='+value,routeType: "wx://upwards"})
		// } else {
			// this.handlePopup()
		// }
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
		this.getUserInfo()
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