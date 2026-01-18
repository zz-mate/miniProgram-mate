// pages/plan/index.ts
import { COLOR } from '../../../utils/color.js';
import { playBtnAudio } from '../../../utils/audioUtil'
import { getThisDate } from '../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.white,
		list:[
			{id:1,name:"明细",type:"bill",icon:"http://oss-api.zz-mate.cn/uploads/2026/01/1768028733498-b6b7b1a1-d147-49e9-9cfd-0c671fcc6078.png",url:"/subPackages/pages/transaction/bill/index"},
			{id:2,name:"预算",type:"budget",icon:"http://oss-api.zz-mate.cn/uploads/2026/01/1768028788001-9eb4ca57-3a45-45de-b1cd-63327981587e.png",url:"/subPackages/pages/transaction/budget/index"},
			{id:3,name:"资产",type:"account",icon:"http://oss-api.zz-mate.cn/uploads/2026/01/1768028802397-eb86e910-7b17-4f06-9f43-00252d483655.png",url:"/pages/account/index"},
			{id:4,name:"日历",type:"calendar",icon:"http://oss-api.zz-mate.cn/uploads/2026/01/1768028824109-0c574862-eaac-4a3c-b8ad-2563991aa63a.png",url:"/subPackages/pages/transaction/calendar/index"},
			{id:5,name:"预约转账",type:"pprepayment", icon:"http://oss-api.zz-mate.cn/uploads/2026/01/1768028547998-0b1ce8c1-51d7-4eb2-a607-ef25c060c62a.png",url:"/subPackages/pages/transaction/prepayment/index"}
		]
  },
	handlePageUrl(evt) {
		const { url, type } = evt.currentTarget.dataset
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let param: string | number = ""
		if (type == 'bill') {
			param = getThisDate("YY") + '&yearMonthMoreActive=1&type=0'
		}
		wx.navigateTo({ url: url + '?date=' + param })
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