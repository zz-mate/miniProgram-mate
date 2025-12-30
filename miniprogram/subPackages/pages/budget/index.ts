// subPackages/pages/budget/index.ts
import { COLOR } from '../../../utils/color.js';
import {playBtnAudio} from '../../../utils/audioUtil'
const app = getApp()
import SystemConfig from '../../../utils/capsule';
import { budgetInfo,deletBudget } from '../../../api/budget'
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
		},
		startX: '',
		startY: ''
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
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		wx.navigateTo({
			url: "/subPackages/pages/budget/add/index?bookId=" + this.data.bookId + '&userId=' + this.data.userId,
			routeType: "wx://upwards"
		})
	},
	handleCategoryBillPage(evt){
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
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

	touchS(e) {
		console.log(e)
		// 1. 解构数据，避免直接操作 this.data 原数据
		let { categoryList, startX, startY } = this.data

		// 2. 安全获取 dataset 中的 index 和 i，防止未定义报错
		let { i } = e.currentTarget.dataset || {};



		// 4. 批量将 transactionList 中所有 list 项的 status 设为 true（核心新增逻辑）
		// 深拷贝原数组，避免直接修改 this.data 里的原数据
		const newTransactionList = JSON.parse(JSON.stringify(categoryList));
		// 遍历外层数组
		newTransactionList.forEach((item) => {


			item.status = true;
					
				
	
		});

		// 5. 统一通过 setData 响应式更新所有数据（坐标 + 列表）
		this.setData({
			startX: e.touches[0].clientX,  // 触摸起始X坐标
			startY: e.touches[0].clientY,  // 触摸起始Y坐标
			categoryList: newTransactionList  // 更新后的列表数据
		}, () => {

		});
	},
	touchM(e) {
		// 1. 安全获取当前触摸坐标，做容错处理
		if (!e.touches || e.touches.length === 0) return;
		var currentX = e.touches[0].clientX;
		var currentY = e.touches[0].clientY;

		// 2. 计算滑动距离（横向/纵向）
		const x = this.data.startX - currentX; // 横向移动距离（x>0 向左滑，x<0 向右滑）
		const y = Math.abs(this.data.startY - currentY); // 纵向移动距离

		// 3. 安全获取 dataset 中的索引（适配 transactionList 的 index/i）
		let { index, i } = e.currentTarget.dataset || {};
		// 兼容原代码的 id 逻辑（如果仍需要 id 可保留）
		// var id = e.currentTarget.dataset.index;

		// 4. 深拷贝原数据，避免直接修改 this.data
		const newTransactionList = JSON.parse(JSON.stringify(this.data.categoryList));

		// 5. 滑动逻辑判断 + 响应式修改 status
		// 适配 transactionList 嵌套结构：修改指定 index 下 list[i] 的 status
		if (newTransactionList[i]) {
			if (x > 35 && y < 110) {
				// 向左滑：显示删除 → status 设为 false
				newTransactionList[i].status = false;
			} else if (x < -35 && y < 110) {
				// 向右滑：隐藏删除 → status 设为 true
				newTransactionList[i].status = true;
			}
		}

		// 7. 响应式更新数据（核心：用新数据替换原数据）
		this.setData({
			categoryList: newTransactionList,
			// effective_carts: newEffectiveCarts, // 如需保留原逻辑可启用
		}, () => {
			// 可选：验证更新结果

		});
	},
	async deleteList(e) {
		try {
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.vibrateShort({ type: 'light' })
			// 1. 安全获取要删除的 id 和 dataset 中的索引（关键：需要 index/i 定位列表项）
			let { budget_category_id,category_id} = e.currentTarget.dataset || {};
			let {bookId,userId} = this.data
	
			// 2. 构造请求参数
			let data = {
				userId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
				budgetCategoryId:budget_category_id, categoryId:category_id
			};
			// 容错：检查 userId 是否存在
			if (!data.userId) {
				wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
				return;
			}
	
			// 3. 调用删除接口
			let res = await deletBudget(data);
			if (res.code === 200) {
				wx.showToast({ title: "删除成功", icon: "none" });
				this.getBudgetInfo(bookId, userId)
				// });
			} else {
				wx.showToast({ title: res.msg || "删除失败", icon: "none" });
			}
		} catch (error) {
			// 捕获异常，避免代码崩溃
			console.error("删除接口调用异常：", error);
			wx.showToast({ title: "网络异常，删除失败", icon: "none" });
		}
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