// pages/home/detail/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips:[{title:'无条件服从第一条',text:'免费不代表真的免费送'},
    {title:'本店只接受打包或者带走',text:'你可以不吃但不可以不买'},
    {title:'进店必须买',text:'买了可以不吃'}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options:{img:string} ) {
    
    this.setData({
      img:decodeURIComponent(options.img)
    })

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