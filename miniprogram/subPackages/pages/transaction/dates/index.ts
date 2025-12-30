// subPackages/pages/transaction/dates/index.ts
// subPackages/pages/transaction/date/index.ts
const app = getApp()
import { getTransactionList ,removeTransaction} from '../../../../api/transaction'
import { getStorageSync } from "../../../../utils/util"
import {playBtnAudio} from '../../../../utils/audioUtil'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		height: app.globalData.systemInfo.autoheight,
		title: "",
		token: "",
		start_time: "",
		type: "",
		bookId: "",
		userId: "",
		categoryId: "",
		userInfo: null,
		transactionList: [],
		// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
		isJumpToDetail: false,
		// 新增标记：是否首次进入页面
		isFirstEnter: true,
		startX: '',
		startY: ''

	},

	/**
	 * 日期筛选账单
	 */
	async getFilterDateTransaction() {
		let { type, bookId, userId, start_time, categoryId } = this.data
		console.log(categoryId)
		let data = {
			type, bookId, userId, start_time,
			categoryId,
			"page": 1,
			"pageSize": 100
		}
		let res = await getTransactionList(data)
		this.setData({
			transactionList: res.list.dataList[0]?.children,
		})


	},

	// 跳转到账单详情页面
	handleTransactionInfo(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		const { transaction_id, transaction_type } = evt.currentTarget.dataset
		// 跳转前标记：已跳转到详情页
		this.setData({
			isJumpToDetail: true
		})
		wx.navigateTo({
			url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
		})
	},
	touchS(e) {
		console.log(e)
		// 1. 解构数据，避免直接操作 this.data 原数据
		let { transactionList, startX, startY } = this.data

		// 2. 安全获取 dataset 中的 index 和 i，防止未定义报错
		let { index, i } = e.currentTarget.dataset || {};

		// 3. 安全访问嵌套数据，打印指定项的 status
		if (transactionList[index] && transactionList[index].list[i]) {
			console.log('当前触摸项的status：', transactionList[index].list[i].status)
		}

		// 4. 批量将 transactionList 中所有 list 项的 status 设为 true（核心新增逻辑）
		// 深拷贝原数组，避免直接修改 this.data 里的原数据
		const newTransactionList = JSON.parse(JSON.stringify(transactionList));
		// 遍历外层数组
		newTransactionList.forEach((item) => {
			// 检查内层 list 是否为有效数组
			if (item.list && Array.isArray(item.list)) {
				// 遍历内层 list，修改所有项的 status 为 true
				item.list.forEach((subItem) => {
					if (typeof subItem === 'object' && subItem !== null) {
						subItem.status = true;
					}
				});
			}
		});

		// 5. 统一通过 setData 响应式更新所有数据（坐标 + 列表）
		this.setData({
			startX: e.touches[0].clientX,  // 触摸起始X坐标
			startY: e.touches[0].clientY,  // 触摸起始Y坐标
			transactionList: newTransactionList  // 更新后的列表数据
		}, () => {
			// 可选：回调验证更新结果
			console.log('响应式更新完成：');
			console.log('触摸坐标：', this.data.startX, this.data.startY);
			console.log('指定项status（更新后）：', transactionList[index]?.list[i]?.status);
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
		const newTransactionList = JSON.parse(JSON.stringify(this.data.transactionList));

		// 5. 滑动逻辑判断 + 响应式修改 status
		// 适配 transactionList 嵌套结构：修改指定 index 下 list[i] 的 status
		if (newTransactionList[index] && newTransactionList[index].list[i]) {
			if (x > 35 && y < 110) {
				// 向左滑：显示删除 → status 设为 false
				newTransactionList[index].list[i].status = false;
			} else if (x < -35 && y < 110) {
				// 向右滑：隐藏删除 → status 设为 true
				newTransactionList[index].list[i].status = true;
			}
		}

		// 7. 响应式更新数据（核心：用新数据替换原数据）
		this.setData({
			transactionList: newTransactionList,
			// effective_carts: newEffectiveCarts, // 如需保留原逻辑可启用
		}, () => {
			// 可选：验证更新结果
			console.log('滑动后 status：', newTransactionList[index]?.list[i]?.status);
		});
	},
	async deleteList(e) {
		try {
			// 1. 安全获取要删除的 id 和 dataset 中的索引（关键：需要 index/i 定位列表项）
			playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
			let { id, index, i } = e.currentTarget.dataset || {};
			if (!id) {
				wx.showToast({ title: "删除失败：缺少账单ID", icon: "none" });
				return;
			}
	
			// 2. 构造请求参数
			let data = {
				userId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
				billId: id
			};
			// 容错：检查 userId 是否存在
			if (!data.userId) {
				wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
				return;
			}
	
			// 3. 调用删除接口
			let res = await removeTransaction(data);
			if (res.code === 200) {
				wx.showToast({ title: "删除成功", icon: "none" });
				this.getFilterDateTransaction()
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
	onLoad({ start_time, type, bookId, userId, categoryName, categoryId,title }) {
		let userInfo = getStorageSync("userInfo")
		let token = getStorageSync("token")
		this.setData({
			title: categoryId == 'undefined' ? title : categoryName,
			start_time, type, bookId, userId, userInfo, token, categoryId,
			// 初始化标记
			isFirstEnter: true,
			isJumpToDetail: false
		})
		// 首次进入：加载数据（仅执行一次）
		this.getFilterDateTransaction()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		// 核心判断逻辑：
		// 1. 不是首次进入（排除onLoad后的首次onShow）
		// 2. 是从详情页返回（isJumpToDetail为true）
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
			console.log("从账单详情页返回，执行刷新")
			this.getFilterDateTransaction()
			// 刷新后重置标记，避免重复刷新
			this.setData({
				isJumpToDetail: false
			})
		}
		// 首次进入后，将标记置为false（后续onShow都是非首次）
		if (this.data.isFirstEnter) {
			this.setData({
				isFirstEnter: false
			})
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() { },

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() { },

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() { },

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() { }
})