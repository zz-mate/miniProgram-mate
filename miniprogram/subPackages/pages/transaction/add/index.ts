// subPackages/pages/transaction/add/index.ts
import { getStorageSync, } from '../../../../utils/util';
import { getAccountList } from '../../../../api/account'
import { getCategoryList } from '../../../../api/category'
import { getBookList } from '../../../../api/book'
import { createTransaction } from '../../../../api/transaction'
import { COLOR } from '../../../../utils/color.js';
import SystemConfig from '../../../../utils/capsule';

const dateUtils = require('../../../../utils/dateutils')
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';

interface BookItem {
	book_id: number;
	book_name: string;
}

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.theme,
		bookInfo: null as unknown as BookItem,
		bookList: [],
		bookIndex: 0,
		selectedTab: 1,// 默认支出

		userInfo: null,

		intoView: '',
		swiperHeight: 0,
		swiperIndex: 1,
		swiperTabs: [
			{
				id: 1,
				title: '收入',
			},
			{
				id: 2,
				title: '支出',
			},

			// {
			//   id:3,
			//   title: '转账'
			// },
			// {
			//   id:4,
			//   title: '借贷'
			// }
		],
		typeList: [{ color: COLOR.incomeColor, name: '收入' }, { color: COLOR.theme, name: '支出' }],
		hasDot: false,
		bill: {
			id: null,// 账单id
			account_id: null,//账户id
			account_name: null,//账户名称
			num: 0, //金额
			transaction_type: 2, //类型1-收入 2-支出  3-转账 4-借贷
			refound: false,// 退款 true 默认 false
			categoryId: 1, //分类id
			remark: '', //备注
			tags: [],
			date: dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['YMDhm'])  //日期
		},

		keyboardHeight: 0, // 键盘高度，初始为0
		keyboardHeadHeight:0,//css键盘header
		calculatorHeight: 0,
		safeAreaBottom: 0,
		tabMoneyCardHeight: 0,
		capsuleHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		deviceType: '',
		safeAreaInset: { top: 0, bottom: 0 },

		showPopup_date: false,
		showPopup_account: false,
		showPopup_user: false,
		showPopup_book: false,
		showPopup_category: false,
		popupType: '',


		// date
		mode: 'YMDhm',
		startDate: `2023/01/01`,
		endDate: `2025/12/31`,
		minScale: 1, // 时间选择器分钟刻度



		accountList: [],//账户列表
		selectedParentIndex: -1, // 选中的父级索引
		selectedChildIndex: -1,   // 选中的子级索引

		categoryIndex: 0,
		categoryList: [],
		queryParams: {
			page: 1,
			pageSize: 100
		},

		selectedCategoryTags: [] as any,
		doneFlag: false,//账本未开发占位

		// 核心计算状态
		firstNum: '',       // 第一个操作数（字符串，支持小数点）
		secondNum: '',      // 第二个操作数（字符串，支持小数点）
		operator: '',       // 当前运算符（+/-）
		calcExpression: '', // 显示的表达式
		isCalculated: false,// 是否已计算出结果
		result: ''          // 计算结果（用于连续运算）
	},

	lifetimes: {
		attached() {

			this.setData({
				bookList: getStorageSync("bookList"),
				bookInfo: getStorageSync("bookInfo"),
				userInfo: getStorageSync("userInfo")
			})
		},
	},




	handleBook() {
		wx.navigateTo({
			url: "/pages/home/book/index?type=add",
			routeType: "wx://bottom-sheet"
		})
	},


	// 初始化计算状态
	initCalc() {
		this.setData({
			firstNum: '',
			secondNum: '',
			operator: '',
			calcExpression: '',
			isCalculated: false,
			result: '',
			'bill.num': 0
		});
	},
	tapKey(e) {
		const key = e.currentTarget.dataset.key;
		wx.vibrateShort({ type: 'heavy' })
		const { firstNum, secondNum, operator, isCalculated, result } = this.data;
		const MAX_AMOUNT = 100000000; // 1亿
		this.getNavBarHeight()
		// ========== 核心工具方法：检查小数点后位数（最多两位） ==========
		const checkDecimalLimit = (numStr) => {
			if (!numStr.includes('.')) return true; // 无小数点，允许输入
			const [, decimalPart] = numStr.split('.');
			return decimalPart.length <= 2; // 小数部分<2位才允许输入
		};
	
		// ========== 1. 计算完成后的输入处理 ==========
		if (isCalculated) {
			if (/[0-9]/.test(key)) {
				// 场景1：计算后输入数字
				if (operator) {
					// 1.1 已有运算符 → 第二个操作数（1亿+两位小数限制）
					const newSecondNum = secondNum + key;
					if (checkDecimalLimit(newSecondNum) && Number(newSecondNum) < MAX_AMOUNT) {
						this.setData({
							secondNum: newSecondNum,
							calcExpression: `${result}${operator}${newSecondNum}`,
							'bill.num': Number(newSecondNum)
						});
					} else if (!checkDecimalLimit(newSecondNum)) {
						wx.showToast({ title: '小数点后最多两位', icon: 'none' });
					} else {
						wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
					}
				} else {
					// 1.2 无运算符 → 拼接结果成新数字（1亿+两位小数限制）
					const newNum = result + key;
					if (checkDecimalLimit(newNum) && Number(newNum) < MAX_AMOUNT) {
						this.setData({
							firstNum: newNum,
							secondNum: '',
							calcExpression: newNum,
							isCalculated: false,
							'bill.num': Number(newNum)
						});
					} else if (!checkDecimalLimit(newNum)) {
						wx.showToast({ title: '小数点后最多两位', icon: 'none' });
					} else {
						wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
					}
				}
			} else if (key === '.') {
				// 场景2：计算后输入小数点（防重复+1亿限制）
				if (operator) {
					if (!secondNum.includes('.') && Number(secondNum + '.') < MAX_AMOUNT) {
						const newSecondNum = secondNum === '' ? '0.' : secondNum + '.';
						this.setData({
							secondNum: newSecondNum,
							calcExpression: `${result}${operator}${newSecondNum}`,
							'bill.num': Number(newSecondNum)
						});
					} else if (secondNum.includes('.')) {
						wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
					} else {
						wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
					}
				} else {
					if (!result.includes('.') && Number(result + '.') < MAX_AMOUNT) {
						const newNum = result + '.';
						this.setData({
							firstNum: newNum,
							secondNum: '',
							calcExpression: newNum,
							isCalculated: false,
							'bill.num': Number(newNum)
						});
					} else if (result.includes('.')) {
						wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
					} else {
						wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
					}
				}
			} else if (/[+-]/.test(key)) {
				// 场景3：计算后点击运算符 → 基于结果继续运算
				if (Number(result) < MAX_AMOUNT) {
					this.setData({
						firstNum: result,
						secondNum: '',
						operator: key,
						calcExpression: `${result}${key}`,
						isCalculated: false,
						'bill.num': Number(result)
					});
				} else {
					wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
				}
			}
			return;
		}
	
		// ========== 2. 常规数字键处理（0-9，1亿+两位小数限制） ==========
		if (/[0-9]/.test(key)) {
			if (!operator) {
				// 无运算符：第一个操作数（1亿+两位小数限制）
				const newFirstNum = firstNum + key;
				if (checkDecimalLimit(newFirstNum) && Number(newFirstNum) < MAX_AMOUNT) {
					this.setData({
						firstNum: newFirstNum,
						calcExpression: newFirstNum,
						'bill.num': Number(newFirstNum)
					});
				} else if (!checkDecimalLimit(newFirstNum)) {
					wx.showToast({ title: '小数点后最多两位', icon: 'none' });
				} else {
					wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
				}
			} else {
				// 有运算符：第二个操作数（1亿+两位小数限制）
				const newSecondNum = secondNum + key;
				if (checkDecimalLimit(newSecondNum) && Number(newSecondNum) < MAX_AMOUNT) {
					this.setData({
						secondNum: newSecondNum,
						calcExpression: `${firstNum}${operator}${newSecondNum}`,
						'bill.num': Number(newSecondNum)
					});
				} else if (!checkDecimalLimit(newSecondNum)) {
					wx.showToast({ title: '小数点后最多两位', icon: 'none' });
				} else {
					wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
				}
			}
			return;
		}
	
		// ========== 3. 小数点处理（防重复+1亿限制） ==========
		if (key === '.') {
			if (!operator) {
				// 第一个操作数加小数点
				if (!firstNum.includes('.') && Number(firstNum + '.') < MAX_AMOUNT) {
					const newFirstNum = firstNum === '' ? '0.' : firstNum + '.';
					this.setData({
						firstNum: newFirstNum,
						calcExpression: newFirstNum,
						'bill.num': Number(newFirstNum)
					});
				} else if (firstNum.includes('.')) {
					wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
				} else {
					wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
				}
			} else {
				// 第二个操作数加小数点
				if (!secondNum.includes('.') && Number(secondNum + '.') < MAX_AMOUNT) {
					const newSecondNum = secondNum === '' ? '0.' : secondNum + '.';
					this.setData({
						secondNum: newSecondNum,
						calcExpression: `${firstNum}${operator}${newSecondNum}`,
						'bill.num': Number(newSecondNum)
					});
				} else if (secondNum.includes('.')) {
					wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
				} else {
					wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
				}
			}
			return;
		}
	
		// ========== 4. 常规运算符处理（+/-） ==========
		if (/[+-]/.test(key)) {
			// 第一个操作数存在且≤1亿时允许输入运算符
			if (firstNum && Number(firstNum) < MAX_AMOUNT) {
				this.setData({
					operator: key,
					calcExpression: `${firstNum}${key}`,
					secondNum: '',
					'bill.num': Number(firstNum)
				});
			} else {
				wx.showToast({ title: '金额不能超过1亿', icon: 'none' });
			}
		}
	},
	// ========== 核心方法：检查小数点后位数（最多两位） ==========
	// checkDecimalLimit(numStr) {
	// 	// 无小数点：允许输入
	// 	if (!numStr.includes('.')) {
	// 		return true;
	// 	}
	// 	// 有小数点：拆分整数和小数部分
	// 	const [integerPart, decimalPart] = numStr.split('.');
	// 	// 小数部分长度 < 2：允许输入；否则禁止
	// 	return decimalPart.length <= 2;
	// },

	// 等于/完成按钮点击
	async tapSubmit(evt) {
		const flag = evt.currentTarget.dataset.again; // 1=再记 2=等于/完成
		const { firstNum, secondNum, operator, isCalculated, result } = this.data;

		// ========== 1. 显示"="的场景（运算符后有第二个操作数） ==========
		if (operator && secondNum) {
			// 执行计算（支持小数点）
			const num1 = Number(firstNum) || 0;
			const num2 = Number(secondNum) || 0;
			let calcResult = 0;

			if (operator === '+') calcResult = num1 + num2;
			if (operator === '-') calcResult = num1 - num2;

			// 强制保留两位小数（金额场景）
			calcResult = parseFloat(calcResult.toFixed(2));

			// 更新状态
			this.setData({
				calcExpression: `${firstNum}${operator}${secondNum}=${calcResult}`,
				result: calcResult.toString(),
				firstNum: calcResult.toString(),
				secondNum: '',
				operator: '',
				isCalculated: true,
				'bill.num': calcResult
			});
			// 仅计算，不提交
			if (flag === 2) return;
		}

		// ========== 2. 显示"完成"的场景（无运算符/运算符后无数字） ==========
		let submitAmount = Number(firstNum) || 0;
		// 保留两位小数
		submitAmount = parseFloat(submitAmount.toFixed(2));
		this.setData({ 'bill.num': submitAmount });

		// 金额验证
		if (submitAmount== 0) {
			wx.showToast({ title: '请输入金额', icon: 'none' });
			return;
		}

		// ========== 3. 提交逻辑（再记/完成） ==========
		if (flag === 1) {
			// 再记：保留计算器状态，仅提交
			await this.submitBill(false);
		} else if (flag === 2) {
			// 完成：提交并重置
			await this.submitBill(true);
		}
	},

	// 删除键逻辑（适配小数点）
	tapDel() {
		const { firstNum, secondNum, operator, isCalculated, calcExpression } = this.data;

		if (isCalculated) {
			this.initCalc();
			return;
		}

		if (secondNum) {
			// 有第二个操作数：删除最后一位（支持小数点）
			const newSecondNum = secondNum.slice(0, -1);
			const newExp = newSecondNum ? `${firstNum}${operator}${newSecondNum}` : `${firstNum}${operator}`;
			this.setData({
				secondNum: newSecondNum,
				calcExpression: newExp,
				'bill.num': newSecondNum ? Number(newSecondNum) : Number(firstNum)
			});
		} else if (operator) {
			// 有运算符无第二个操作数：删除运算符
			this.setData({
				operator: '',
				calcExpression: firstNum,
				'bill.num': Number(firstNum)
			});
		} else if (firstNum) {
			// 只有第一个操作数：删除最后一位（支持小数点）
			const newFirstNum = firstNum.slice(0, -1);
			this.setData({
				firstNum: newFirstNum,
				calcExpression: newFirstNum,
				'bill.num': newFirstNum ? Number(newFirstNum) : 0
			});
		}
	},

	// 长按删除：清空所有
	longpressDel() {
		this.initCalc();
		if (this.delInterval) clearInterval(this.delInterval);
		this.delInterval = setInterval(() => this.tapDel(), 100);
	},

	// 停止长按删除
	stopInterval() {
		if (this.delInterval) {
			clearInterval(this.delInterval);
			this.delInterval = null;
		}
	},

	// 提交账单核心方法
	async submitBill(resetCalc = true) {
		const { bill } = this.data;

		// 分类验证
		if (!this.data.doneFlag) {
			wx.showToast({
				title: '没有分类你点什么😠',
				icon: "none"
			});
			return;
		}



		// 构造提交数据
		let data = {
			"user_id": getStorageSync("userInfo").id,
			"consume_user_id": getStorageSync("userInfo").id,
			"account_id": bill.account_id,
			"book_id": this.data.bookInfo?.id,
			"category_id": this.data.categoryList[this.data.categoryIndex].id,
			"type": bill.transaction_type,
			"amount": Number(Math.abs(bill.num)),
			"currency": "CNY",
			"tags": JSON.stringify(bill.tags),
			"bill_time": bill.date.replace(/\//g, '-') + ':00',
			"remark": bill.remark
		};

		try {
			// 调用保存接口
			let res = await createTransaction(data);

			if (res.code == 200) {
				wx.showToast({
					title: '记账成功',
					icon: "none"
				});	// 完成：重置计算器
				this.initCalc();
				if (resetCalc) {


					setTimeout(() => wx.navigateBack({ delta: 1 }), 600);
				} else {
					// 再记：仅重置账单数据，保留计算器状态
					// this.initCalc();
					// this.setData({
					// 	'bill.remark': '',
					// 	'bill.tags': []
					// });
				}
			} else {
				wx.showToast({
					title: res.msg || '记账失败',
					icon: "none"
				});
			}
		} catch (error) {
			console.error('提交失败:', error);
			wx.showToast({
				title: '网络异常，请重试',
				icon: "none"
			});
		}
	},


	initKeyboardListener() {
		// 确保只监听一次
		if (this.keyboardListener) return;

		// 方式1: 使用wx.onKeyboardHeightChange
		this.keyboardListener = wx.onKeyboardHeightChange(res => {
			this.setData({
				keyboardHeight: res.height == 0 ? 0 : res.height - this.data.calculatorHeight - this.data.safeAreaBottom
			});
		});
	},
	onInputFocus(e) {
		// 聚焦时可以强制获取一次键盘高度（某些机型需要）
		setTimeout(() => {
		}, 500);
	},

	onInputBlur() {
		// 失焦时重置高度
		this.setData({ keyboardHeight: 0 });
	},

	bindKeyInput(e) {
		this.setData({
			'bill.remark': e.detail.value
		})
		console.log('输入内容:', e.detail.value);
	},


	getNavBarHeight() {
		const query = wx.createSelectorQuery();
		query.select('.keyboard-container').boundingClientRect();
		query.select('.money-content').boundingClientRect();
		query.select('.keyboard-head').boundingClientRect();
		
		query.exec((res) => {
			if (res) {
				this.setData({
					calculatorHeight: res[0].height,
					tabMoneyCardHeight: res[1].height,
					keyboardHeadHeight: res[2].height,
				});
			}
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
		const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作

		if (type == 'date') {
			const date = this.data.bill.date
			this.setData({
				date: date ? new Date(date).getTime() : new Date().getTime(),
			})
		} else if (type == 'account') {
			this.handleAccountList()
		} else if (type == 'book') {
			this.handleBookList()
		} else if (type == 'category') {
			// this.setData({
			//   'queryParams.pageSize':100
			// })
			this.getCategoryListFn()
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
		//     if(this.data.showPopup_category){
		//       this.setData({
		//   'queryParams.pageSize':14
		// })
		// this.getCategoryListFn()
		// }
		this.setData(data);
	},

	/**
	 * 关闭选择日期
	 */
	onConfirmDate(e) {
		let mode = this.data.mode;
		let date = e.detail.date;
		let renderTime = dateUtils.formatLongTime(date, dateUtils.modeMapToFields[mode]);
		this.setData({
			'bill.date': renderTime
		})
		// this.handleCloseOverlay()
	},
	/**
	 * 获取账本
	 */
	async handleBookList() {
		let data = {
			userId: getStorageSync('userInfo').id
		}
		let res = await getBookList(data)
		this.setData({
			bookList: res.list,
		})
	},
	/**
	 * 
	 * 选择账本
	 */
	handleMenoSelected({ currentTarget }: any) {
		let that = this
		let { bookList } = this.data
		let index = currentTarget.dataset.index
		that.setData({
			bookIndex: index,
			bookInfo: bookList[index],
			categoryList: []
		})

		// 更改账本分类 例如： 日常 汽车
		this.getCategoryListFn()
	},

	/**
	 * 获取账户列表
	 */
	async handleAccountList() {
		let data = {
			userId: getStorageSync('userInfo').user_id
		}
		let res = await getAccountList(data)
		this.setData({
			accountList: res.data
		})
	},
	/**
	 *  处理账户选择事件
	 */
	handleChooseAccount(e) {
		// 获取点击事件传递的索引数据
		const { parentIndex, childIndex } = e.currentTarget.dataset;

		// 更新选中状态
		this.setData({
			selectedParentIndex: parentIndex,
			selectedChildIndex: childIndex
		});

		// 如果你需要获取选中的数据
		const selectedItem = this.data.accountList[parentIndex]?.list[childIndex];
		console.log('选中的账户：', selectedItem);
		this.setData({
			'bill.account_id': selectedItem.account_id,
			'bill.account_name': selectedItem.account_name
		})
		// 这里可以添加其他业务逻辑，比如回调、数据提交等
	},
	handleAccountDefault() {
		this.setData({
			selectedParentIndex: -1,
			selectedChildIndex: -1
		});

		this.setData({
			'bill.account_id': "",
			'bill.account_name': ""
		})
	},

	/**
	 * 退款
	 */
	handleRefund() {
		this.setData({
			'bill.refound': !this.data.bill.refound
		})
	},

	/**
	 * 类别列表
	 */
	async getCategoryListFn() {
		let { userInfo, selectedTab, queryParams, bookList, bookIndex } = this.data
		// console.log(bookList, bookIndex, 123)
		let res = await getCategoryList({ userId: userInfo.id, type: selectedTab + 1, ...queryParams, bookCategoryId: bookList[bookIndex].book_category_id })
		this.setData({
			categoryList: res.list,
			categoryIndex: 0,
			doneFlag: res.list.length > 0 ? true : false
		})
	},
	/**
	 * 选择类别  服饰 日用 交通 
	 */
	handleChooseCategory(e) {
		wx.vibrateShort({ type: 'heavy' })
		let { index } = e.currentTarget.dataset

		this.setData({
			categoryIndex: index,
			selectedCategoryTags: []
		})
		this.updateCategorySelectedStatus()
		this.getNavBarHeight()
	},
	/**
	 * 类别标签  服饰 - 外套 多选
	 */
	// 处理标签选择（支持多选）
	// 页面加载时或数据更新时调用此方法来更新选中状态
	updateCategorySelectedStatus() {
		const { categoryList, categoryIndex, selectedCategoryTags } = this.data;

		if (!categoryList[categoryIndex] || !categoryList[categoryIndex].children) return;

		// 复制一份数据并更新每个标签的选中状态
		const updatedCategoryList = [...categoryList];
		updatedCategoryList[categoryIndex].children = updatedCategoryList[categoryIndex].children.map(item => ({
			...item,
			isSelected: selectedCategoryTags.indexOf(item.id) !== -1
		}));
		// console.log(updatedCategoryList)
		this.setData({
			categoryList: updatedCategoryList
		});
	},

	handleCategoryTagSelect(e) {
		const { category, index } = e.currentTarget.dataset;
		const { selectedCategoryTags, bill } = this.data;
		// 解构分类ID和Name（确保字段存在）
		const { id: categoryId, name: categoryName } = category;

		// 判断当前标签是否已选中（纯ID数组判断）
		const isSelected = selectedCategoryTags.indexOf(categoryId) !== -1;
		let newSelectedTags = [];
		// 深拷贝bill.tags，避免引用修改原数据
		let newBillTags = JSON.parse(JSON.stringify(bill.tags || []));

		if (isSelected) {
			// ✅ 取消选择：移除ID，同时删除bill.tags中对应对象
			newSelectedTags = selectedCategoryTags.filter(id => id !== categoryId);
			newBillTags = newBillTags.filter(item => item.id !== categoryId);
		} else {
			// ✅ 新增选择：添加ID，同时添加ID+Name到bill.tags
			newSelectedTags = [...selectedCategoryTags, categoryId];

			// 数量限制判断（提前拦截）
			if (newSelectedTags.length > 3) {
				wx.showToast({
					title: '最多选择3个标签',
					icon: 'none'
				});
				return;
			}

			// 避免重复添加（按ID去重）
			const isTagExist = newBillTags.some(item => item.id === categoryId);
			if (!isTagExist) {
				newBillTags.push({ id: categoryId, name: categoryName });
			}

			console.log('选中的标签：', category, 'bill.tags：', newBillTags);
			console.log('选中的标签ID数组：', newSelectedTags);
		}

		// 更新数据：同步更新ID数组和ID+Name对象数组
		this.setData({
			selectedCategoryTags: newSelectedTags,
			'bill.tags': newBillTags // 关键：将ID+Name对象数组赋值给bill.tags
		}, () => {
			// 更新完选中数组后，立即更新标签的选中状态
			this.updateCategorySelectedStatus();
		});
	},

	// 配套：更新标签选中状态（给categoryList的子项添加isSelected标记）
	// updateCategorySelectedStatus() {
	// 	const { categoryList, categoryIndex, selectedCategoryTags } = this.data;
	// 	// 深拷贝避免修改原数据
	// 	const newCategoryList = JSON.parse(JSON.stringify(categoryList));
	// 	// 获取当前分类下的子标签
	// 	const currentChildren = newCategoryList[categoryIndex].children;

	// 	// 遍历子标签，标记选中状态（适配小程序WXML无表达式限制）
	// 	currentChildren.forEach(item => {
	// 		item.isSelected = selectedCategoryTags.indexOf(item.id) !== -1;
	// 	});

	// 	this.setData({
	// 		categoryList: newCategoryList
	// 	});
	// },
	// 清空选择
	// clearSelectedTags() {
	//   this.setData({
	//     selectedCategoryTags: []
	//   });
	// },

	// 获取选中的标签详情
	// getSelectedTagsDetails() {
	//   const { categoryList, categoryIndex, selectedCategoryTags } = this.data;
	//   const currentChildren = categoryList[categoryIndex].children || [];

	//   return currentChildren.filter(item => 
	//     selectedCategoryTags.includes(item.category_id)
	//   );
	// },

	/**
	 * 生命周期函数--监听页面加载
	 */

	onLoad(options) {
		console.log(options)
		this.getNavBarHeight()
		let bookList = getStorageSync("bookList")
		const bookIndex = bookList.findIndex(ele => ele.id == options.bookId)
		const systemInfo = wx.getSystemInfoSync();
		this.setData({
			safeAreaBottom: systemInfo.screenHeight - systemInfo.safeArea.bottom,
			bookIndex,
			'bill.date': options.date || this.data.bill.date
		});
		// 提前在onLoad中就开始监听
		this.initKeyboardListener();
		this.initCalc();
	},
	/**
 * 生命周期函数--监听页面卸载
 */
	onUnload() {
		this.stopInterval();
		if (this.keyboardListener) {
			this.keyboardListener();
		}
	},

	/**
	 * 切换类型
	 */
	onTabChanged(evt: any) {
		const index = evt.detail.current
		this.setData({
			selectedTab: index,
			'bill.transaction_type': this.data.swiperTabs[index].id
		})
		this.getCategoryListFn()
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		this.initSystemConfig();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.setData({
			bookList: getStorageSync("bookList"),
			bookInfo: getStorageSync("bookInfo"),
			userInfo: getStorageSync("userInfo")
		})
		this.getCategoryListFn()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

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