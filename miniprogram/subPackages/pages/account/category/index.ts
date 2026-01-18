// subPackages/pages/account/category/index.ts
const app = getApp()
import { getStorageSync } from '../../../../utils/util';
import { getAccountIndexCategoryList } from '../../../../api/account'
import { COLOR } from '../../../../utils/color';
import { playBtnAudio } from '../../../../utils/audioUtil'

Page({
  data: {
    height: app.globalData.systemInfo.autoheight,
    title: "",
    type: 0,
    list: [],
    parentId: 0,
    curr: -1,
    scrollViewId: "",
    barHeight: 0,
    barTop: 0,
    barOffset: 0,
    showLetter: false,
    navBgColor: COLOR.white
  },

  async getBookCategoryList() {
    let { type, parentId } = this.data
    let data = { parentId, isLetterGroup: type == 2 ? true : false }
    let res = await getAccountIndexCategoryList(data)
    this.setData({
      list: res
    })
    console.log(res)
  },

  handleBookSelected(evt) {
    playBtnAudio('/static/audio/btnaudio.mp3', 1000);
    wx.vibrateShort({ type: 'light' })
    let userInfo = getStorageSync("userInfo")
    const { item } = evt.currentTarget.dataset
    const { parentId } = this.data
    console.log(item)
    let params = `accountCategoryId=${parentId}&icon=${item.icon}&userId=${userInfo.id}&title=${item.name}&parentId=${item.parentId}&id=${item.id}`

    wx.navigateTo({
      url: `/subPackages/pages/account/add/index?${params}`
    })
  },

// 替换原有 handleBarItemClick 函数
handleBarItemClick(evt) {
  // 播放点击音效
  playBtnAudio('/static/audio/btnaudio.mp3', 500);
  // 轻微震动反馈
  wx.vibrateShort({ type: 'light' });
  
  // 获取点击的字母索引
  const { index } = evt.currentTarget.dataset;
	console.log(index,'9999')
  const indexNum = Number(index);
  
  // 边界值校验
  if (indexNum < 0 || indexNum >= this.data.list.length) return;
  
  const item = this.data.list[indexNum];
	console.log(item)
  if (item) {
    // 核心修复：一次性更新所有数据，避免异步导致的闪烁
    this.setData({
      scrollViewId: item.letter,
      curr: indexNum,
      showLetter: true // 和 curr 同时更新，不会显示旧值
    });
    
    // 300ms后隐藏字母提示
    setTimeout(() => {
      this.setData({
        showLetter: false
      });
    }, 300);
  }
},

  onLoad({ accountCategoryId, title, type }) {
    this.setData({
      title: '添加' + title,
      parentId: Number(accountCategoryId),
      type: Number(type)
    })
    
    wx.getSystemInfo({
      success: (res) => {
        let winHeight = res.windowHeight
        let barHeight = winHeight - res.windowWidth / 750 * 300;
        let barTop = (winHeight - barHeight) / 2;
        
        this.setData({
          barHeight: barHeight,
          barTop: barTop,
          barOffset: this.data.height
        })
      }
    })
    
    this.getBookCategoryList()
  },

  touch(e) {
		let pageY = e.touches[0].pageY - this.data.barOffset;
		console.log(pageY,"pageY")
		let index = Math.floor((pageY - this.data.barTop) / (this.data.barHeight / 22));
		
		// 边界值处理
		if (index < 0) index = 0;
		if (index >= this.data.list.length) index = this.data.list.length - 1;
		console.log(index)
		let item = this.data.list[index];
		if (item) {
			// 一次性更新所有相关数据，避免闪烁
			this.setData({
				scrollViewId: item.letter,
				curr: index
			});
		}
  },

  touchStart(e) {
    this.setData({
      showLetter: true
    })
    this.touch(e)
  },

  touchMove(e) {
    this.touch(e)
  },

  touchEnd() {
    this.setData({
      showLetter: false,
    })
  },

  touchCancel() {
    this.setData({
      showLetter: false,
    })
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {}
})