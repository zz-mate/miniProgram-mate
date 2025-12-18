const app = getApp();

import {getStorageSync ,setStorageSync} from '../../../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
   height:app.globalData.systemInfo.autoheight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      value:options.value
    })
    let memorandum= getStorageSync('memorandum')
// 使用 find 方法查找对象
let foundObject = memorandum.find(obj => obj.value == options.value);
//  console.log(memorandum);
 
// 检查是否找到了对象
if (foundObject) {
  this.setData({
    html:foundObject
  })
  console.log('Found object:', foundObject);
} else {
  this.setData({
    html:''
  })
  console.log('No object found with the specified value.');
}

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onEditorReady() {
    // console.log(2);
    
    wx.createSelectorQuery().select('#editor').context(res => {
      this.editorCtx = res.context;
      console.log(this.data);
      if(this.data.html){
        this.editorCtx.setContents({
          html: this.data.html.html,
          success: res => {
            console.log('[setContents success]')
          }
        })
      }else{
        this.editorCtx.setContents({
          html: app.globalData.richTextContents,
          success: res => {
            console.log('[setContents success]')
          }
        })
      }
     
    }).exec()
  }
})