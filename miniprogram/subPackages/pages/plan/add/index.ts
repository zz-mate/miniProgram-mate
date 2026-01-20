// subPackages/pages/plan/add/index.ts
import { COLOR } from '../../../../utils/color.js';
import { playBtnAudio } from '../../../../utils/audioUtil'
import { getStorageSync } from '../../../../utils/util';
import { createPlan, info, update } from '../../../../api/plan'
const dateUtils = require('../../../../utils/dateutils')
const app = getApp()
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		planOrMemoName:"",
		capsuleHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight + 70,
		planTime: "",
		userInfo: null,
		showPopup_date: false,
		popupType: '',
		params: {
			name: "",
			desc: "",
			content: []

		},
		planId: '',
		categoryIdCounter: 5,
		weightTotal: 1.0,
		saveDisabled: true // 新增：保存按钮禁用状态，初始为禁用
	},

	// ========== 基础输入绑定 ==========
	bindKeyInputName(e) {
		this.setData({
			'params.name': e.detail.value,
			saveDisabled: !e.detail.value // 关键：名称为空则禁用保存按钮
		});
	},

	bindKeyInputDesc(e) {
		this.setData({
			'params.desc': e.detail.value
		});
	},

	// ========== 分类相关操作 ==========
	// 添加新分类
	addNewCategory() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const newCategory = {
			id: this.data.categoryIdCounter++,
			title: "",
			items: [{ name: "", completed: false }],
			checked: false,
			note: "",
			priority: 2,
			weight: 0.1
		};

		// 重新计算权重（均分）
		const content = [...this.data.params.content];
		const totalCount = content.length + 1;
		const avgWeight = 1.0 / totalCount;

		content.forEach(item => {
			item.weight = avgWeight;
		});
		newCategory.weight = avgWeight;

		content.unshift(newCategory);
		this.setData({
			'params.content': content
		});
	},

	// 删除分类
	deleteCategory(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const id = e.currentTarget.dataset.id;
		const content = this.data.params.content.filter(item => item.id !== id);

		// 重新分配权重
		const totalCount = content.length;
		if (totalCount > 0) {
			const avgWeight = 1.0 / totalCount;
			content.forEach(item => {
				item.weight = avgWeight;
			});
		}

		this.setData({
			'params.content': content
		});
	},

	// 优化：分类勾选（反选+多选联动）
	toggleCategoryCheck(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const id = e.currentTarget.dataset.id;
		const content = [...this.data.params.content];
		const index = content.findIndex(item => item.id === id);

		if (index !== -1) {
			// 1. 反选：切换当前分类的选中状态
			const newChecked = !content[index].checked;
			content[index].checked = newChecked;

			// 2. 多选联动：分类选中/取消时，同步所有子项状态
			content[index].items.forEach(item => {
				item.completed = newChecked;
			});

			this.setData({
				'params.content': content
			});
		}
	},

	// 编辑分类标题
	editCategoryTitle(e) {
		const id = e.currentTarget.dataset.id;
		const value = e.detail.value;
		const content = [...this.data.params.content];
		const index = content.findIndex(item => item.id === id);

		if (index !== -1) {
			content[index].title = value;
			this.setData({
				'params.content': content
			});
		}
	},

	// 修改分类优先级（彻底修复 undefined 问题）
	changePriority(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);

		// ========== 关键1：正确获取事件参数 ==========
		// 优先用 e.target.dataset（避免currentTarget冒泡问题）
		const categoryIdStr = e.target?.dataset?.categoryId || e.currentTarget?.dataset?.categoryId;
		// 无参数直接返回，避免报错
		if (!categoryIdStr) {
			wx.showToast({ title: '参数异常', icon: 'none' });
			return;
		}
		// 转为数字类型（和item.id保持一致）
		const categoryId = Number(categoryIdStr);

		// ========== 关键2：安全获取picker选中值 ==========
		const priorityIndex = parseInt(e.detail.value);
		if (isNaN(priorityIndex) || priorityIndex < 0 || priorityIndex > 2) {
			wx.showToast({ title: '选择异常', icon: 'none' });
			return;
		}
		const newPriority = priorityIndex + 1; // 1=高,2=中,3=低

		// ========== 关键3：深拷贝数据+类型匹配查找 ==========
		// 深拷贝避免直接修改原数据（小程序数据更新最佳实践）
		const content = JSON.parse(JSON.stringify(this.data.params.content));
		// 用数字类型的categoryId查找，确保匹配
		const categoryIndex = content.findIndex(item => Number(item.id) === categoryId);

		// ========== 关键4：兜底处理，避免index=-1 ==========
		if (categoryIndex === -1) {
			wx.showToast({ title: '未找到对应分类', icon: 'none' });
			return;
		}

		// 更新优先级
		content[categoryIndex].priority = newPriority;
		this.setData({
			'params.content': content
		}, () => {
			// 回调确认更新成功，可选反馈
			// wx.showToast({
			//   title: `优先级设为${newPriority === 1 ? '高' : newPriority === 2 ? '中' : '低'}`,
			//   icon: 'none',
			//   duration: 1000
			// });
		});
	},

	// 编辑分类备注
	editCategoryNote(e) {

		const id = e.currentTarget.dataset.id;
		const value = e.detail.value;
		const content = [...this.data.params.content];
		const index = content.findIndex(item => item.id === id);

		if (index !== -1) {
			content[index].note = value;
			this.setData({
				'params.content': content
			});
		}
	},

	// ========== 子项相关操作 ==========
	// 添加新子项
	addNewItem(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const categoryId = e.currentTarget.dataset.id;
		const content = [...this.data.params.content];
		const index = content.findIndex(item => item.id === categoryId);

		if (index !== -1) {
			content[index].items.push({
				name: "",
				completed: false
			});
			this.setData({
				'params.content': content
			});
		}
	},

	// 删除子项
	deleteItem(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { categoryId, itemIndex } = e.currentTarget.dataset;
		const content = [...this.data.params.content];
		const categoryIndex = content.findIndex(item => item.id === categoryId);

		if (categoryIndex !== -1) {
			content[categoryIndex].items.splice(itemIndex, 1);
			// 子项删除后，检查是否需要更新分类勾选状态
			this.checkCategoryCheckedStatus(content, categoryIndex);
			this.setData({
				'params.content': content
			});
		}
	},

	// 优化：子项勾选（反选+联动分类）
	toggleItemCompleted(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { categoryId, itemIndex } = e.currentTarget.dataset;
		const content = [...this.data.params.content];
		const categoryIndex = content.findIndex(item => item.id === categoryId);

		if (categoryIndex !== -1) {
			// 1. 反选：切换当前子项的选中状态
			content[categoryIndex].items[itemIndex].completed = !content[categoryIndex].items[itemIndex].completed;

			// 2. 联动分类：检查子项是否全部选中，更新分类状态
			this.checkCategoryCheckedStatus(content, categoryIndex);

			this.setData({
				'params.content': content
			});
		}
	},

	// 辅助方法：检查分类下所有子项状态，更新分类勾选状态
	checkCategoryCheckedStatus(content, categoryIndex) {
		const category = content[categoryIndex];
		// 判断是否所有子项都已完成
		const allCompleted = category.items.every(item => item.completed);
		// 判断是否有至少一个子项完成
		const hasCompleted = category.items.some(item => item.completed);

		// 逻辑：
		// - 所有子项完成 → 分类选中
		// - 部分子项完成 → 分类取消（也可自定义为"半选"状态）
		// - 无任何子项完成 → 分类取消
		category.checked = allCompleted;
	},

	// 编辑子项名称
	editItemName(e) {

		const { categoryId, itemIndex } = e.currentTarget.dataset;
		const value = e.detail.value;
		const content = [...this.data.params.content];
		console.log(JSON.stringify(content))
		const categoryIndex = content.findIndex(item => item.id === categoryId);
console.log(categoryId,itemIndex,categoryIndex)
		if (categoryIndex !== -1) {
			content[categoryIndex].items[itemIndex].name = value;
			this.setData({
				'params.content': content
			});
		}
	},

	// ========== 保存计划 ==========
	async savePlan() {
		const notify = this.selectComponent('#customNotify');
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);

		const planName = this.data.params.name.trim();
		if (!planName) {

			return notify.showNotify({
				message: '请填写计划名称',
				type: 'warning',
				duration: 1500
			});
		}

		if (this.data.id) {
			this.updatePlan()
			return
		}
		let data = {
			userId: this.data.userInfo.id,
			...this.data.params,
			planTime: this.data.planTime,
			planType: getStorageSync("planIndex")
		}

		let res = await createPlan(data)
		if (res.code == 200) {
			notify.showNotify({
				message: res.message,
				type: 'success',
				duration: 1500
			});
			// this.onSubscribeTap()
			wx.navigateBack({ delta: 1 })
		}
		// console.log('最终计划数据：', JSON.stringify(data));
	},
	/**
		 * 处理弹窗显示 子组件传递
		 * @param {Event} evt - 事件对象
		 */
	handleChildPopup(data: any) {
		let { delta, type } = data.detail

		// const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作

		// 封装更新弹窗状态的方法
		this.updatePopupStatus(type, !delta);
	},
	handlePopup(evt) {
		wx.vibrateShort({ type: 'light' });
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作

		if (type == 'date') {
			const date = this.data.planTime
			this.setData({
				date: date ? new Date(date).getTime() : new Date().getTime(),
			})
		}
		// 封装更新弹窗状态的方法
		this.updatePopupStatus(type, true);
	},

	/**
	 * 处理弹窗关闭
	 */
	handleCloseOverlay() {
		const { popupType } = this.data;
		if (!popupType) return; // 增加空值校验


		this.updatePopupStatus(popupType, false);
	},

	/**
	 * 统一更新弹窗状态的方法
	 * @param {string} type - 弹窗类型
	 * @param {boolean} show - 是否显示弹窗
	 */
	updatePopupStatus(type, show) {
		const key = `${POPUP_SHOW_KEY_PREFIX}${type}`;
		const data = {
			[key]: show
		};
		// 如果是显示弹窗，同时记录当前弹窗类型
		if (show) {
			data.popupType = type;
		}
		this.setData(data);
	},
	async getPlanInfo(id) {
		let data = {
			userId: getStorageSync("userInfo").id,
			id
		}
		let res = await info(data)
		console.log(res)
		this.setData({
			params: res.data.data,
			planTime:res.data.data.plan_time,
		})
	},
	async updatePlan() {
		let data = {
			userId: getStorageSync("userInfo").id,
			planId: this.data.id,
			planType: getStorageSync("planIndex"),
			...this.data.params,
			planTime: this.data.planTime,
		}

		let res = await update(data)
		if (res.code == 200) {
			wx.navigateBack({ delta: 1 })
		}
	},
	/**
	 * 关闭选择日期
	 */
	onConfirmDate(e) {
		let date = e.detail.date;
		let renderTime = dateUtils.formatLongTime(date, dateUtils.modeMapToFields['YMDhm']);
		this.setData({
			'planTime': renderTime
		})
		// this.handleCloseOverlay()
	},


	// ========== 生命周期函数 ==========
	onLoad({ planTime, id }) {
		let planIndex = getStorageSync("planIndex")
		if (id) {
			this.getPlanInfo(id)
		}
		this.setData({
			userInfo: getStorageSync("userInfo"),
			title: planIndex == 1 ? '添加备忘录' : '添加计划',
			saveDisabled: true, // 初始禁用保存按钮
			id,
			planOrMemoName:planIndex == 1 ? '备忘录' : '计划',
			'planTime': planTime ? planTime : dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['YMDhm'])
		})
	},
	onReady() { },
	onShow() {


	},
	onHide() { },
	onUnload() { },
	onPullDownRefresh() { },
	onReachBottom() { },
	onShareAppMessage() { }
})