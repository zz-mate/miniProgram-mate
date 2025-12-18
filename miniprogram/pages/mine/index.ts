// pages/mine/index.ts
import { getStorageSync, setStorageSync } from '../../utils/util';
import { getUserById } from '../../api/user';
import SystemConfig from '../../utils/capsule';
import { COLOR } from '../../utils/color.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.theme,
    navBarHeight: 0,
    statusBarHeight: 0,
    deviceType: '',
    safeAreaInset: { top: 0, bottom: 0 },
    show: false,
    userInfo: null,
    height: app.globalData.systemInfo.autoheight + 70,
  },

  handlePopup() {
    console.log(1);

    this.setData({
      show: !this.data.show
    })
  },
  handleCloseOverlay(e: any) {
    console.log(e);

    this.setData({
      show: !this.data.show
    })

  },
  handleLogin() {
    wx.navigateTo({
      url: "/pages/login/index",
    })
  },

  handleClick({ detail }: any) {
    console.log(detail);

  },
  handleUserInfo() {
    let token = getStorageSync("token")
    if (token) {
      wx.navigateTo({
        url: "/subPackagesMine/pages/userInfo/index"
      })
    } else {
      wx.navigateTo({
        url: "/pages/login/index"
      })
    }
  },
  initSystemConfig() {
    const capsuleConfig = SystemConfig.getCapsuleConfig();
    const safeAreaInset = SystemConfig.getSafeAreaInset();
    console.log(capsuleConfig.navBarHeight, "capsuleConfig.navBarHeight")
    this.setData({
      capsuleHeight: capsuleConfig.capsuleHeight,
      navBarHeight: capsuleConfig.navBarHeight,
      statusBarHeight: capsuleConfig.statusBarHeight,
      deviceType: capsuleConfig.isIOS ? 'iOS' : capsuleConfig.isAndroid ? 'Android' : 'Unknown',
      safeAreaInset
    });
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
    this.initSystemConfig()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getTabBar().setData({ selected: 3 })
    let token = getStorageSync("token")
    if (!token) return
    let userInfo = getStorageSync("userInfo")

    getUserById({ userId: userInfo.id }).then((res) => {
			console.log(res.data)
      setStorageSync('userInfo', res.data);
      this.setData({
        userInfo: res.data
      })
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