// subPackages/pages/plan/info/index.ts
import { COLOR } from '../../../../utils/color.js';
import { playBtnAudio } from '../../../../utils/audioUtil'
import { info, update } from '../../../../api/plan'
import { getStorageSync } from '../../../../utils/util.js';
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		planHeaderIndex: 0,
		height: app.globalData.systemInfo.autoheight+70,
		id: '',
		name: '',
		planInfo: {

		},
		// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
		isJumpToDetail: false,
		// 新增标记：是否首次进入页面
		isFirstEnter: true,
	},
	async getPlanInfo(planId) {
		let data = {
			userId: getStorageSync("userInfo").id,
			planId
		}
		let res = await info(data)
		console.log(res)
		this.setData({
			planInfo: res.data
		})
	},
	async updatePlan() {
		let data = {
			userId: getStorageSync("userInfo").id,
			planId: this.data.id,
			planType: getStorageSync("planIndex"),
			...this.data.planInfo,
			planTime: this.data.planInfo.plan_time,
		}
		console.log(data)
		await update(data)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ id, name }) {
		this.setData({ id, name })
		this.getPlanInfo(id)
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
		let planHeaderIndex = getStorageSync("planIndex")

		this.setData({ planHeaderIndex })
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
			this.getPlanInfo(this.data.id)
			// 刷新后重置标记，避免重复刷新
			this.setData({
				isJumpToDetail: false
			})
		}
		if (this.data.isFirstEnter) {
			this.setData({
				isFirstEnter: false
			})
		}

	},

	/**
	 * 处理清单项的勾选/取消勾选
	 */
	handleChoosePlan(e) {
		const notify = this.selectComponent('#customNotify');
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);


		try {
			// 1. 获取点击事件传递的索引参数
			const { catIndex, itemIndex } = e.currentTarget.dataset;


			// 2. 深拷贝当前数据，避免直接修改原数据
			const newPlanInfo = JSON.parse(JSON.stringify(this.data.planInfo));

			// 3. 切换对应项的completed状态
			const targetItem = newPlanInfo.content[catIndex].items[itemIndex];
			targetItem.completed = !targetItem.completed;

			// 4. 可选：自动标记分类是否全部完成
			const categoryItems = newPlanInfo.content[catIndex].items;
			const allCompleted = categoryItems.every(item => item.completed);
			newPlanInfo.content[catIndex].checked = allCompleted;

			// 5. 重新计算整体完成进度
			newPlanInfo.progress = this.calculateProgress(newPlanInfo);

			// 6. 更新页面数据
			this.setData({
				planInfo: newPlanInfo
			});
			this.updatePlan()
			// 7. 可选：提示用户操作成功
			notify.showNotify({
				message: targetItem.completed ? '已完成' : '已取消',
				type: 'success',
				duration: 1500
			});
		} catch (error) {
			console.error('处理勾选失败:', error);
			wx.showToast({ title: '操作失败', icon: 'none' });
		}
	},

	/**
	 * 辅助方法：计算清单整体完成进度（百分比）
	 */
	calculateProgress(planInfo) {
		if (!planInfo?.content || planInfo.content.length === 0) return 0;

		let totalItems = 0;
		let completedItems = 0;

		// 遍历所有分类的子项
		planInfo.content.forEach(category => {
			if (category.items && category.items.length) {
				totalItems += category.items.length;
				completedItems += category.items.filter(item => item.completed).length;
			}
		});

		// 计算百分比（保留1位小数）
		return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 1000) / 10;
	},
	handleCreatPlab() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			isJumpToDetail: true
		})
		wx.navigateTo({
			url: '/subPackages/pages/plan/add/index?id=' + this.data.planInfo.id,
			routeType: "wx://upwards"
		});
	},
	initSystemConfig() {
		const capsuleConfig = SystemConfig.getCapsuleConfig();
		const safeAreaInset = SystemConfig.getSafeAreaInset();
		this.setData({
			capsuleHeight: capsuleConfig.capsuleHeight,
			navBarHeight: capsuleConfig.navBarHeight,
			statusBarHeight: capsuleConfig.statusBarHeight,
			deviceType: capsuleConfig.isIOS ? 'iOS' : capsuleConfig.isAndroid ? 'Android' : 'Unknown',
			safeAreaInset
		});
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