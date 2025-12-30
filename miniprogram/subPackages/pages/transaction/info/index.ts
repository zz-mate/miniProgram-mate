// subPackages/pages/transaction/info/index.ts
import { transactionInfo,removeTransaction } from "../../../../api/transaction"
import { COLOR } from '../../../../utils/color.js';
import { getStorageSync} from '../../../../utils/util';
import {playBtnAudio} from '../../../../utils/audioUtil'
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.theme,
    id:null,
    title:"",
    transactionInfo:null,//账单详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({id,type}) {
    let title = ""
    switch(type){
      case  '1':
        title = '收入'
      break;
      case '2':
        title = '支出'
      break;
      case '3':
        title = '转账'
      break;
      case '4':
        title = '借贷'
      break;
    }
    this.setData({
      id,title
    })
    let data = {
      userId:getStorageSync("userInfo").id,
      billId:id
    }
    this.getTransactionInfo(data)
  },


  /**
   * 获取账单详情
   */
  async getTransactionInfo({userId,billId}){
    let res = await transactionInfo({userId,billId})
    console.log(res)
    this.setData({
      transactionInfo:res.data
    })
  },
  /**
   * 打开删除弹窗
   */
  handleRemove(){
    let that = this
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
    wx.showModal({
      title: "温馨提示",
      content: "确认删除该账单吗？",
      success(res) {
        if (res.confirm) {
					playBtnAudio('/static/audio/click.mp3', 1000);
          that.handleConfirm()
        }

      }
    })
  },

  /**
   * 删除账单
   */
  async handleConfirm(){
    let data = {
      userId:getStorageSync("userInfo").id,
      billId:this.data.id
    }
    let res = await removeTransaction(data)
    if(res.code==200){
      wx.showToast({
        title:"删除成功",
        icon:"none"
      })
      setTimeout(()=>{
          wx.navigateBack({
            delta: 1
          })
      },600)
   
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