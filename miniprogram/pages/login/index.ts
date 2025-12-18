// pages/login/index.ts

import { login, getUserInfo } from '../../api/user';
import { createBook } from '../../api/book'
import { validatePhoneNumber } from '../../utils/util'
import { setStorageSync } from '../../utils/util';
import { setToken } from '../../utils/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: true,
    privacy: false,
    show: false,
    phone: ''
  },
  bindKeyInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  handleChange(e: any) {
    console.log(e);
    this.setData({
      checked: !this.data.checked
    })

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
  handlePrivacy(e: any) {
    console.log(e);
    this.setData({
      privacy: !this.data.privacy
    })

  },
  handlePrivacyOpen() {
    console.log('前往查看');

  },
  /**
   * 登录 获取用户信息
   */
  handleLogin() {

    if (!this.data.privacy) return
    if (!validatePhoneNumber(this.data.phone)) {
      wx.showToast({
        title: "请输入正确手机号",
        icon: "none"
      })
      return
    }
    login({ phone: this.data.phone })
      .then((res) => {
        setToken(res.data.token)

        getUserInfo().then((res) => {
          setStorageSync('userInfo', res.data);
          if (res.data.bookNums == 0) {//没有账本 就去创建账本页面
            let data = {
              user_id: res.data.user_id,
              book_name: "日常账本",
              currency: "CNY",
              is_default:1
            }
            createBook(data).then(ret => {
              if (ret.code == 200) {
                wx.reLaunch({
                  url: "/pages/home/index"
                })
              }
            })
          } else {
            wx.reLaunch({
              url: "/pages/home/index"
            })

          }
        })
      })
      .catch((error) => {
        wx.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none',
        });
      })
      .finally(() => {

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