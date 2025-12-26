// subPackages/pages/budget/index.ts
import { COLOR } from '../../../utils/color.js';
const app = getApp()
import SystemConfig from '../../../utils/capsule';
import { budgetInfo } from '../../../api/budget'
import { getStorageSync,getThisDate, matchAndSortArrays, calculateRemainingPercentage } from '../../../utils/util'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scrollHeight:0,
		navBarHeight:0,
		statusBarHeight:0,
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight + 120,
		userId: null,
		bookId: null,
		queryParams: {
			page: 1,
			pageSize: 50
		},
		categoryList: [],
		budgetInfo: {
			budget_amount: "0.00",
			remaining_amount: "0.00",
			remaining_percent: 100,
			surplus_amount: "0.00"
		}
	},


	/**
	 * 支出类别
	 */
	//   async getCategoryListFn(list) {
	//     let userId = getStorageSync("userInfo").id
	//     let res = await getCategoryList({ userId, type: 2, ...this.data.queryParams })
	// 		console.log(res)
	//     const resultList = matchAndSortArrays({
	//       targetList: res.list,
	//       sourceList: list,
	//       showOnlyMatched: true,
	//       assignKeys: ['category_amount','category_actual_amount','remaining_percent'] // 新增匹配 字段
	//     });
	// // console.log(resultList)
	// resultList.forEach((ele)=>{
	//   ele.percentage = calculateRemainingPercentage( Number(ele.budget_amount), Number(ele.spent_amount))
	//   ele.budgetAmount = Math.round(Math.abs(parseFloat(ele.budget_amount)))
	// })
	//     this.setData({
	//       categoryList: resultList,
	//     })
	//     console.log(resultList)
	//   },
	/**
	 * 预算详情
	 * @param bookId 
	 * @param userId 
	 */
	async getBudgetInfo(bookId, userId) {
		let data = {
			bookId, userId,
			"budgetType": "monthly"
		}
		let res = await budgetInfo(data)
		this.setData({
			budgetInfo: res.data,
			categoryList: res.data?.categories,
		})
		this.getSccollHeight()
		// console.log(res.data)
		// let list = res.data?.categories || []
		// this.getCategoryListFn(list)
	},
	/**
	 * 设置预算
	 */
	handleSettingBudget() {
		wx.vibrateShort({ type: 'heavy' })
		wx.navigateTo({
			url: "/subPackages/pages/budget/add/index?bookId=" + this.data.bookId + '&userId=' + this.data.userId,
			routeType: "wx://upwards"
		})
	},
	handleCategoryBillPage(evt){
		wx.vibrateShort({ type: 'heavy' })
		const {category_id,category_name} = evt.currentTarget.dataset
		let bookInfo = getStorageSync("bookInfo")
		let userInfo = getStorageSync("userInfo")
		let url = "/subPackages/pages/transaction/date/index?start_time=" + getThisDate('YY-MM') + '&type=' + 100 + '&bookId=' + bookInfo.id + '&userId=' + userInfo.id + '&categoryId=' + category_id + '&categoryName=' + category_name
		wx.navigateTo({
			url
		})
	},
		/**
	 * 顶部高度
	 */
		initSystemConfig() {
			const capsuleConfig = SystemConfig.getCapsuleConfig();
			this.setData({
				navBarHeight: capsuleConfig.navBarHeight,
				statusBarHeight: capsuleConfig.statusBarHeight,
			});
		},
		/**
	 * 获取中间区域高度
	 */
		getSccollHeight() {
		
			const query = wx.createSelectorQuery();
			query.select('.header-card').boundingClientRect();
			query.select('.budget-category-title').boundingClientRect();
			
			query.exec((res) => {
				console.log(res)
				if (res) {
					this.setData({
						scrollHeight: res[0].height + res[1].height  + this.data.navBarHeight + this.data.statusBarHeight + 20
					});
				}
			})
	
		},
	/**
	 * 
	 * 获取焦点
	 */
	onInputFocus(evt) {
		console.log(evt)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		this.initSystemConfig()

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
		let token = getStorageSync("token")
		if (!token) return
		let bookId = getStorageSync("bookInfo").id
		let userId = getStorageSync("userInfo").id
		this.setData({
			userId, bookId
		})
		this.getBudgetInfo(bookId, userId)
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