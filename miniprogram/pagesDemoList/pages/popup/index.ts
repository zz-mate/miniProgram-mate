// pagesDemoList/pages/popup/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    mode:'bottom'
  },
  handlePopupMode({currentTarget}:any){
    // console.log(e);
    this.setData({
      mode:currentTarget.dataset.mode
    })
  },
  handlePopup(){
    this.setData({
      show:!this.data.show
    })
  },
  handleCloseOverlay(e:any){
    this.setData({
      show:!this.data.show
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