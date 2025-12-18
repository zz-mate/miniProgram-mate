// pages/secondFloor/secondFloor.ts
import { COLOR } from '../../utils/color.js';
const { shared, spring } = wx.worklet
const GestureState={
  ACTIVE:2,
  END:3
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBgColor: COLOR.theme,
  },


  onRouteDone() {
    console.info('@@@ goods page routeDone ')
    this.setData({
      'goodsData.hasRouteDone': true,
    })
    if (this.eventChannel) {
      this.eventChannel.emit('nextPageRouteDone', { });
    }
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.eventChannel = this.getOpenerEventChannel()


    const offset = shared(0);
    this.applyAnimatedStyle(".circle", () => {
      "worklet";
      return {
        marginLeft: `${offset.value}px`,
      };
    });
    this._offset = offset;
  },
  handlepan(evt) {
    "worklet";
    console.log(evt);
    
    if (evt.state === GestureState.ACTIVE) {
      this._offset.value += evt.deltaX;
    } else if (evt.state === GestureState.END) {
      this._offset.value = spring(100);
      
      
    }
    console.log( this._offset.value);
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