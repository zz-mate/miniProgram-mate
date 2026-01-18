import { COLOR } from '../../../../utils/color.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
		navBgColor: COLOR.white,
  },
	handleNotify(){
 // 获取组件实例
 const notify = this.selectComponent('#customNotify');
 notify.showNotify({
	 message: '操作成功！',
	 type: 'success',
	 duration: 1500
 });
	},
  // 显示成功提示
  showSuccessNotify() {
    // 获取组件实例
    const notify = this.selectComponent('#customNotify');
    notify.showNotify({
      message: '操作成功！',
      type: 'success',
      duration: 1500
    });
  },

  // 显示错误提示
  showErrorNotify() {
    const notify = this.selectComponent('#customNotify');
    notify.showNotify({
      message: '操作失败，请重试！',
      type: 'error'
    });
  },

  // 显示自定义提示
  showCustomNotify() {
    const notify = this.selectComponent('#customNotify');
    notify.showNotify({
      message: '自定义提示（5秒后关闭）',
      type: 'warning',
      duration: 5000,
      // top: 120 // 调整距离顶部的位置
    });
  },

  // 提示关闭后的回调
  onNotifyClose() {
    console.log('提示框已关闭');
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