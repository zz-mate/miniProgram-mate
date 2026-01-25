import { COLOR } from '../../utils/color.js';
import SystemConfig from '../../utils/capsule';
import { playBtnAudio } from '../../utils/audioUtil'
import {getPlan,planByMonth,removePlan} from '../../api/plan'
import { getStorageSync, setStorageSync ,getThisDate} from '../../utils/util.js';

const dateUtils = require('../../utils/dateutils')
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		capsuleHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight + 70,
		planHeaderIndex: 0,
		planHeaderlist: [
			{ id: 1, name: "备忘录", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768552787445-78d6d4bb-9a8e-4c6b-8f6a-131626d2ed4e.png" },
			{ id: 2, name: "计划", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768552760549-d450ece2-a95b-4d82-81f9-fc6282381665.png" }
		],
		spot: [],
		dailyList: [],
		planList: [],
		planTime:'',
		startX: '',
		startY: ''
	},

	handlePlanHeaderTap(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			planHeaderIndex: evt.currentTarget.dataset.index
		})
		let planIndex = evt.currentTarget.dataset.index == 0 ? 1 : 2
		setStorageSync("planIndex", planIndex)
		this.getPlanList()
	},
	handleNotify() {
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

	touchS(e) {
		let { planList } = this.data
		const newTransactionList = JSON.parse(JSON.stringify(planList));
		newTransactionList.forEach((item) => {
			item.statu = true;
		});
		this.setData({
			startX: e.touches[0].clientX,  // 触摸起始X坐标
			startY: e.touches[0].clientY,  // 触摸起始Y坐标
			planList: newTransactionList  // 更新后的列表数据
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
		let { i } = e.currentTarget.dataset || {};
		// 兼容原代码的 id 逻辑（如果仍需要 id 可保留）
		// var id = e.currentTarget.dataset.index;

		// 4. 深拷贝原数据，避免直接修改 this.data
		const newTransactionList = JSON.parse(JSON.stringify(this.data.planList));

		// 5. 滑动逻辑判断 + 响应式修改 status
		// 适配 transactionList 嵌套结构：修改指定 index 下 list[i] 的 status
		if (newTransactionList[i]) {
			if (x > 35 && y < 110) {
				// 向左滑：显示删除 → status 设为 false
				newTransactionList[i].statu = false;
			} else if (x < -35 && y < 110) {
				// 向右滑：隐藏删除 → status 设为 true
				newTransactionList[i].statu = true;
			}
		}

		// 7. 响应式更新数据（核心：用新数据替换原数据）
		this.setData({
			planList: newTransactionList,
		}, () => {
			// 可选：验证更新结果

		});
	},
	async deleteList(e) {
		let { id} = e.currentTarget.dataset || {};
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const notify = this.selectComponent('#customNotify');

	let data = {
		userId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
		planId:id
	};

		let res = await removePlan(data)
		if(res.code==200){
					notify.showNotify({
			message: "删除成功",
			type: 'success',
			duration: 1500
		});
		this.getPlanByMonth()
		let planIndex = getStorageSync("planIndex")
		if (!planIndex) {
			setStorageSync("planIndex", 1)
		}else{
			this.setData({
				planHeaderIndex:planIndex==2?1:0
			})
		}
		this.getPlanList()
		}

	},
	handlePlanPage(evt) {
		let { id,name} = evt.currentTarget.dataset || {};
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.navigateTo({
			url: "/subPackages/pages/plan/info/index?id="+id+'&name='+name,

			routeType: "wx://upwards"
		})
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
	dateChange(e) {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		let dateString = e.detail.dateString
		let planTime = dateString 
		this.setData({
			planTime
		})
		// wx.navigateTo({
		// 	url: '/subPackages/pages/plan/add/index?planTime=' + planTime,
		// 	routeType: "wx://upwards"
		// });
		this.getPlanList()
	},

	async getPlanList(){
		let data = {
			userId:getStorageSync("userInfo").id,
			plan_type:getStorageSync("planIndex"),
			page:1,pageSize:10000,
			planDate:this.data.planTime||  getThisDate("YY-MM-DD")
		}
	let res = 	await getPlan(data)
this.setData({planList:res.data.list})
	},
	async getPlanByMonth(){
		let data = {
			userId:getStorageSync("userInfo").id,
		
			startTime:getThisDate("YY-MM")
			
		}
		let res = 	await planByMonth(data)
this.setData({dailyList:res.data.dailyList})
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
		this.getPlanByMonth()
		let planIndex = getStorageSync("planIndex")
		if (!planIndex) {
			setStorageSync("planIndex", 1)
		}else{
			this.setData({
				planHeaderIndex:planIndex==2?1:0
			})
		}
		this.getPlanList()
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