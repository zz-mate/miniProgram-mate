// subPackages/pages/budget/add/index.ts
const app = getApp()
import { getCategoryList } from '../../../../api/category'
import { budgetInfo, createBudget } from '../../../../api/budget'
import { getStorageSync, matchAndSortArrays, getThisDate, getCurrentMonthDays } from '../../../../utils/util'
import SystemConfig from '../../../../utils/capsule';

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scrollHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		height: app.globalData.systemInfo.autoheight + 120,
		userId: null,
		bookId: null,
		queryParams: {
			page: 1,
			pageSize: 50
		},
		categoryList: [] as any,
		categories: [],
		budgetInfo: {
			budget_total_amount: "0.00",
			category_amount: "0.00",
		},
		totalBudgetOriginal: "0.00",
		originalBudgets: {} // 存储每个输入框的原始预算值（key: 索引, value: 原始值）
	},


	/**
	 * 支出类别
	 */
	async getCategoryListFn(list, flag) {
		let userId = getStorageSync("userInfo").id
		let res = await getCategoryList({ userId, type: 2, ...this.data.queryParams })
		const resultList = matchAndSortArrays({
			targetList: res.list,
			sourceList: list,
			// showOnlyMatched:false,
			assignKeys: ['category_amount', 'category_actual_amount', 'remaining_percent'] // 新增 remark 字段
		});
		this.setData({
			categoryList: resultList,
		})
		this.getSccollHeight()
		// 如果分类下有 预算分类 就计算分类的总预算
		if (list.length && flag) {
			this.calculateTotalBudget()
		}

	},
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
			"budgetInfo.budget_total_amount": res.data == null ? '0.00' : res.data.amount,
			"budgetInfo.category_amount": res.data == null ? '0.00' : res.data.amount
		})
		let list = res.data == null ? [] : res.data.categories
		this.getCategoryListFn(list, false)
	},
	/**
	 * 
	 * 获取焦点
	 */
	/**
	 * 获取中间区域高度
	 */
	getSccollHeight() {
		const query = wx.createSelectorQuery();
		query.select('.header-card').boundingClientRect();
		query.select('.budget-category-title').boundingClientRect();
		query.select('.save-button').boundingClientRect();
		query.exec((res) => {
			if (res) {
				this.setData({
					scrollHeight: res[0].height + res[1].height + res[2].height + this.data.navBarHeight + this.data.statusBarHeight + 10
				});
			}
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
	 * 输入框获取焦点事件：清空当前输入框值，备份原始值
	 * @param {Object} e - 事件对象
	 */
	bindBudgetInputFocus(e) {
		const index = e.currentTarget.dataset.index; // 当前分类索引
		const originalVal = e.currentTarget.dataset.val || ''; // 原始预算值（从 data-val 取，而非直接读 categoryList）
		const categoryList = [...this.data.categoryList]; // 解构数组

		// 1. 备份原始值（仅在首次聚焦时备份，避免覆盖已输入的临时值）
		if (this.data.originalBudgets[index] === undefined) {
			this.setData({
				[`originalBudgets[${index}]`]: originalVal
			});
		}

		// 2. 清空当前输入框的值（仅在聚焦时清空，方便用户重新输入）
		categoryList[index].category_amount = '';
		this.setData({ categoryList });
		// console.log(categoryList)

		console.log(`【${categoryList[index].name}】输入框聚焦，已清空原有值，原始预算：`, originalVal);
	},

	/**
	 * 新增：输入框失去焦点事件（核心修复：保存输入值/恢复原始值）
	 * @param {Object} e - 事件对象
	 */
	bindBudgetInputBlur(e) {
		const index = e.currentTarget.dataset.index;
		const inputVal = e.detail.value.trim(); // 用户最终输入的值
		const originalVal = this.data.originalBudgets[index] || ''; // 备份的原始值
		const categoryList = [...this.data.categoryList];
		const currentItem = categoryList[index];

		// 逻辑：用户输入为空 → 恢复原始值；否则保留输入值（并转为数字格式避免字符串问题）
		if (inputVal === '') {
			// 空输入：恢复原始值（若原始值也为空，设为默认值 0）
			currentItem.category_amount = originalVal || 0;
			console.log(`【${currentItem.name}】输入为空，已恢复原始值/默认值：`, currentItem.category_amount);
		} else {
			// 有输入：保留输入值（转为数字类型，避免后续计算时字符串拼接问题）
			currentItem.category_amount = Number(inputVal);
			console.log(`【${currentItem.name}】失焦，已保存输入值：`, currentItem.category_amount);
		}

		// 更新数据，确保值被保留
		this.setData({ categoryList });
		// 清空该索引的原始值备份（避免下次聚焦时使用旧备份）
		this.setData({ [`originalBudgets[${index}]`]: undefined });
		// 重新计算总预算（保持原有逻辑）
		this.calculateTotalBudget();
	},

	/**
	 * 输入框输入事件：实时更新值+输入校验（无修改，保持原有逻辑）
	 * @param {Object} e - 事件对象
	 */
	bindTotalBudgetInput(e) {
		const index = e.currentTarget.dataset.index;
		let newInputVal = e.detail.value.trim();
		const categoryList = [...this.data.categoryList];
		const currentItem = categoryList[index];

		// 输入校验
		if (newInputVal.length > 11) {
			wx.showToast({
				title: `【${currentItem.category_name}】预算最多11位`,
				icon: 'none',
				duration: 1500
			});
			return;
		}
		if (newInputVal.indexOf('.') !== newInputVal.lastIndexOf('.')) {
			return; // 禁止多个小数点
		}
		if (newInputVal.includes('.') && newInputVal.split('.')[1].length > 2) {
			newInputVal = newInputVal.slice(0, newInputVal.indexOf('.') + 3); // 限制两位小数
		}

		// 实时更新值（此处保持字符串，失焦时转为数字）
		currentItem.category_amount = newInputVal;
		this.setData({ categoryList });
		console.log(`【${currentItem.category_name}】实时输入值：`, newInputVal);
		// 实时计算总预算（可选：若需要实时更新总金额，保留；否则可移到失焦时）
		// this.calculateTotalBudget();
	},


	/**
	 * 保存预算
	 */
	async save() {
		wx.vibrateShort({ type: 'heavy' })
		const { categoryList, userId, bookId } = this.data
		let data = {
			"user_id": userId, // 用户ID
			"book_id": bookId,
			"amount": this.data.budgetInfo.category_amount,
			"cycle_type": "month", // 月预算
			"cycle_start": `${getThisDate('YY-MM')}-01`,
			// "warning_rate": 0.8, // 80%预警
			"categories": this.getValidBudgetArray(categoryList)
		}
		// console.log(data)
		// return
		let res = await createBudget(data)
		if (res.code == 200) {
			wx.navigateBack({ delta: 1 })
		}
		// console.log(data)
	},



	/**
	 * 核心方法：计算所有分类的预算总金额
	 */
	calculateTotalBudget() {
		const { categoryList } = this.data;
		let total = 0;

		// 遍历所有分类，累加有效预算值
		categoryList.forEach(item => {
			// 过滤无效值（空字符串、非数字），转为数字后累加
			const amount = parseFloat(item.category_amount) || 0;
			total += amount;
		});

		// 格式化总金额为两位小数（金额规范）
		const formattedTotal = total.toFixed(2);
		// 判断 分类的总预算金额 小于 之前设置现有的总预算 就不计入总预算
		// console.log(total, Number(this.data.budgetInfo.category_amount), Number(this.data.budgetInfo.budget_total_amount))

		// console.log(total > Number(this.data.budgetInfo.budget_total_amount))
		if (total > Number(this.data.budgetInfo.budget_total_amount)) {
			this.setData({ 'budgetInfo.category_amount': formattedTotal });
			// this.setData({ 'budgetInfo.budget_total_amount': formattedTotal });
		} else {

			this.setData({ 'budgetInfo.category_amount': this.data.budgetInfo.budget_total_amount });
		}
		// return
		// // 更新总金额到页面 
		// this.setData({ 'budgetInfo.category_amount': formattedTotal });
	},
	getValidBudgetArray() {
		const { categoryList } = this.data;
		// 遍历筛选+格式化
		const validArray = categoryList.filter(item => {
			// 筛选条件：category_amount 非空、是数字、且大于0
			// const amount = parseFloat(item.category_amount);
			// return item.category_amount !== '' && !isNaN(amount) && amount > 0;
			return item
		}).map(item => {
			// 格式化每一项为目标结构（category_amount 转为整数）
			return {
				category_id: item.category_id, // 必须确保原数据有 category_id 字段
				category_name: item.name,
				category_amount: item.category_amount // 转为整数
			};
		});

		// 更新到页面数据中，方便后续使用（如提交、展示）
		// this.setData({categories: validBudgetArray });
		// console.log('有效预算分类数组：', validBudgetArray);
		return validArray;
	},
	/**
	 * 总预算输入框 - 聚焦事件（对齐循环表单的 bindBudgetInputFocus）
	 */
	bindTotalBudgetFocus(e) {
		// 1. 备份原始值（和循环表单一样，从 data-val 获取）
		const originalVal = e.currentTarget.dataset.val || '';
		this.setData({ totalBudgetOriginal: originalVal });

		// 2. 清空输入框（和循环表单聚焦清空逻辑一致）
		this.setData({
			'budgetInfo.category_amount': ''
		});

		console.log('总预算输入框聚焦，原始值备份：', originalVal);

		// 3. 可选：聚焦后选中内容（若未清空，可选中全部，这里因清空无需选中）
		// 保持和循环表单一致的延迟逻辑，确保键盘正常调起
		setTimeout(() => {
			wx.createSelectorQuery()
				.in(this)
				.select('.budget-input.num') // 选中总预算输入框
				.fields({ node: true })
				.exec((res) => {
					const inputNode = res[0]?.node;
					if (inputNode) inputNode.focus(); // 确保聚焦状态
				});
		}, 100);
	},

	/**
	 * 总预算输入框 - 输入事件（保持原有校验逻辑）
	 */
	bindTotalBudgetInput(e) {
		let inputVal = e.detail.value.trim();

		// 1. 长度限制（11位）
		if (inputVal.length > 11) {
			wx.showToast({ title: '总预算最多11位字符', icon: 'none', duration: 1500 });
			inputVal = inputVal.slice(0, 11);
		}

		// 2. 禁止多个小数点
		const dotCount = (inputVal.match(/\./g) || []).length;
		if (dotCount > 1) {
			const firstDotIndex = inputVal.indexOf('.');
			inputVal = inputVal.slice(0, firstDotIndex + 1) + inputVal.slice(firstDotIndex + 1).replace(/\./g, '');
		}

		// 3. 限制小数点后2位
		if (inputVal.includes('.')) {
			const decimalPart = inputVal.split('.')[1];
			if (decimalPart.length > 2) {
				inputVal = inputVal.slice(0, inputVal.indexOf('.') + 3);
			}
		}

		// 4. 过滤非数字字符
		inputVal = inputVal.replace(/[^0-9.]/g, '');

		// 5. 处理开头多余的0
		if (inputVal.startsWith('0') && inputVal.length > 1 && !inputVal.startsWith('0.')) {
			inputVal = inputVal.slice(1);
		}

		// 实时更新
		// this.setData({
		//   'budgetInfo.budget_total_amount': inputVal
		// });

		console.log('总预算实时输入值：', inputVal);
	},

	/**
	 * 总预算输入框 - 失焦事件（对齐循环表单的 bindBudgetInputBlur）
	 */
	bindTotalBudgetBlur(e) {
		const finalVal = e.detail.value.trim();
		const originalVal = this.data.totalBudgetOriginal || '';
		let formattedAmount = '';

		// 1. 空值处理：恢复原始值（和循环表单一致）
		if (!finalVal) {

			this.setData({
				'budgetInfo.category_amount': this.data.budgetInfo.budget_total_amount
			});
			// this.calculateTotalBudget()
			// this.setData({
			//   'budgetInfo.category_amount': "0.00"
			// });
			// wx.showToast({ title: '总预算恢复为原始值', icon: 'none', duration: 1200 });
			// console.log('总预算失焦未输入，恢复原始值：', originalVal);
			return;
		}

		// 2. 格式化：转为整数（和循环表单总预算逻辑一致，四舍五入）
		formattedAmount = Math.round(parseFloat(finalVal));

		// 3. 有效性校验：金额必须大于0（和循环表单校验逻辑一致）
		if (formattedAmount <= 0) {
			wx.showToast({ title: '总预算必须大于0', icon: 'none', duration: 1500 });
			// 校验不通过，恢复原始值（可选，按业务需求）
			formattedAmount = originalVal ? Math.round(parseFloat(originalVal)) : '';
		}


		this.calculateTotalBudget()

		let { category_amount, budget_total_amount } = this.data.budgetInfo
		console.log(category_amount, budget_total_amount)
		let that = this
		if (formattedAmount < Number(category_amount)) {
			wx.showModal({
				title: "温馨提示",
				content: `当前输入的总预算小于分类预算的总和${category_amount}，是否更新为总预算`,
				confirmText: "更新",
				cancelText: "不更新",
				success(res) {
					if (res.confirm) {
						that.setData({
							'budgetInfo.category_amount': category_amount.toString(),
							'budgetInfo.budget_total_amount': category_amount.toString()
						});
						console.log(category_amount)
					} else {
						that.setData({
							'budgetInfo.category_amount': formattedAmount.toString(),
							'budgetInfo.budget_total_amount': formattedAmount.toString()
						});
					}
				}
			})
		} else {
			that.setData({
				'budgetInfo.category_amount': formattedAmount.toString(),
				'budgetInfo.budget_total_amount': formattedAmount.toString()
			});
		}
		console.log('总预算失焦，最终值（整数）：', formattedAmount);

	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ bookId, userId }) {
		this.setData({
			userId, bookId
		})
		/**预算信息 */
		this.getBudgetInfo(bookId, userId)
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		this.initSystemConfig()
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