// pages/plan/index.ts
import { COLOR } from '../../../../utils/color.js';
import { playBtnAudio } from '../../../../utils/audioUtil'
import { appointmentList, removeAppointment } from '../../../../api/appointment'
import { getStorageSync } from '../../../../utils/util'
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight + 70,
		list: [],
		startX: '',
		startY: ''
	},



	handlePageUrl() {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		// wx.navigateTo({
		// 	url: "./info/index"
		// })
	},
	handleAdd() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.navigateTo({
			url: "/subPackages/pages/transaction/prepayment/add/index"
		})
	},
	async getAppointmentList() {
		let data = {
			userId: getStorageSync("userInfo").id
		}
		let res = await appointmentList(data)
		console.log(res)
		this.setData({
			list: res.data.list
		})
	},
	touchS(e) {
		console.log(e)
		// 1. 解构数据，避免直接操作 this.data 原数据
		let { list, startX, startY } = this.data

		// 2. 安全获取 dataset 中的 index 和 i，防止未定义报错
		let { i } = e.currentTarget.dataset || {};



		// 4. 批量将 transactionList 中所有 list 项的 status 设为 true（核心新增逻辑）
		// 深拷贝原数组，避免直接修改 this.data 里的原数据
		const newTransactionList = JSON.parse(JSON.stringify(list));
		// 遍历外层数组
		newTransactionList.forEach((item) => {


			item.stat = true;



		});

		// 5. 统一通过 setData 响应式更新所有数据（坐标 + 列表）
		this.setData({
			startX: e.touches[0].clientX,  // 触摸起始X坐标
			startY: e.touches[0].clientY,  // 触摸起始Y坐标
			list: newTransactionList  // 更新后的列表数据
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
		const newTransactionList = JSON.parse(JSON.stringify(this.data.list));

		// 5. 滑动逻辑判断 + 响应式修改 status
		// 适配 transactionList 嵌套结构：修改指定 index 下 list[i] 的 status
		if (newTransactionList[i]) {
			if (x > 35 && y < 110) {
				// 向左滑：显示删除 → status 设为 false
				newTransactionList[i].stat = false;
			} else if (x < -35 && y < 110) {
				// 向右滑：隐藏删除 → status 设为 true
				newTransactionList[i].stat = true;
			}
		}

		// 7. 响应式更新数据（核心：用新数据替换原数据）
		this.setData({
			list: newTransactionList,
			// effective_carts: newEffectiveCarts, // 如需保留原逻辑可启用
		}, () => {
			// 可选：验证更新结果

		});
	},
	async deleteList(e) {
		try {
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.vibrateShort({ type: 'light' })
			// 1. 安全获取要删除的 id 和 dataset 中的索引（关键：需要 index/i 定位列表项）
			let { id, version } = e.currentTarget.dataset || {};

			// 2. 构造请求参数
			let data = {
				userId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
				version, id
			};
			// 容错：检查 userId 是否存在
			if (!data.userId) {
				wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
				return;
			}

			// 3. 调用删除接口
		await removeAppointment(data);

				this.getAppointmentList()
			
		
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
		this.getAppointmentList()

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