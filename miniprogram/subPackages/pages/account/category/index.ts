// subPackages/pages/account/category/index.ts
const app = getApp()
import { getStorageSync } from '../../../../utils/util';
import { getAccountIndexCategoryList } from '../../../../api/account'
import { COLOR } from '../../../../utils/color';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		height: app.globalData.systemInfo.autoheight,
		title:"",
		list: [],
		parentId:0,
		curr: -1,
    scrollViewId: "",
    barTop: 0,
    showLetter: false,
		navBgColor:COLOR.white
	},
	/**
	 * 账本分类列表
	 */
	async getBookCategoryList() {
		let {parentId} = this.data
		console.log(parentId)
		let data = {parentId}
		console.log(data)
		let res = await getAccountIndexCategoryList(data)
		this.setData({
			list: res
		})
		console.log(res)
	},
	handleBookSelected(evt) {
		let userInfo = getStorageSync("userInfo")
		const { item } = evt.currentTarget.dataset
		let params = `accountCategoryId=${item.id}&icon=${item.icon}&description=${item.description}&userId=${userInfo.id}&title=${item.name}`
		if(item.type==1){
			wx.navigateTo({
				url: `/subPackages/pages/account/add/index?${params}`
			})
		}else{
					wx.navigateTo({
			url: `/subPackages/pages/account/category/index?${params}`
		})
		}

	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ accountCategoryId,title }) {
		this.setData({
			title:'添加'+title,
			parentId: Number(accountCategoryId),

		})
		wx.getSystemInfo({
      success: (res) => {
        let winHeight = res.windowHeight
        let barHeight = winHeight - res.windowWidth / 750 * 300;
        this.setData({
          barHeight: barHeight,
          barTop: res.windowWidth / 750 * 180,
        })
      }
    })
		this.getBookCategoryList()
	},

	touch(e) {
    let pageY = e.touches[0].pageY
    let index = Math.floor((pageY - this.data.barTop) / (this.data.barHeight / 22))//向下取整
    let item = this.data.list[index]
    if (item) {
      this.setData({
        scrollViewId: item.letter,
        curr: index
      })
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