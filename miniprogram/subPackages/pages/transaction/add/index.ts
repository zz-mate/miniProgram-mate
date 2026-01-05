// subPackages/pages/transaction/add/index.ts
import { playBtnAudio } from '../../../../utils/audioUtil'
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
		keyboardHeadHeight: 0,//css键盘header
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
		result: '',         // 计算结果（用于连续运算）
		//  bill: { num: 0 },   // 账单金额
		//  doneFlag: false,    // 分类选中标记
		//  selectedTab: 0,     // 标签选中状态
		//  categoryList: [],   // 分类列表
		//  categoryIndex: 0,   // 选中分类索引
		//  bookInfo: {},       // 账本信息
		delInterval: null   // 删除长按定时器
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

	// // 获取导航栏高度（保留原有逻辑）
	// getNavBarHeight() {
	//   // 你的原有逻辑...
	// },

	tapKey(e) {
		const key = e.currentTarget.dataset.key;
		wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
		const { firstNum, secondNum, operator, result } = this.data;

		// ========== 核心工具方法 ==========
		// 检查小数点后位数（最多两位）
		const checkDecimalLimit = (numStr) => {
			if (!numStr.includes('.')) return true;
			const [, decimalPart] = numStr.split('.');
			return decimalPart.length <= 2;
		};
		// 检查字符长度（最多8位）
		const checkLengthLimit = (numStr) => {
			return numStr.length <= 8;
		};

		// ========== 1. 数字键处理（核心连续运算逻辑） ==========
		if (/[0-9]/.test(key)) {
			// 有结果（如2）：往第二个操作数追加（如2+3）
			if (result && operator) {
				const newSecondNum = secondNum + key;
				if (checkDecimalLimit(newSecondNum) && checkLengthLimit(newSecondNum)) {
					this.setData({
						secondNum: newSecondNum,
						calcExpression: `${result}${operator}${newSecondNum}`,
						'bill.num': Number(newSecondNum)
					});
				} else if (!checkDecimalLimit(newSecondNum)) {
					// wx.showToast({ title: '小数点后最多两位', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			// 无结果，有运算符（如1+）：往第二个操作数追加
			else if (operator) {
				const newSecondNum = secondNum + key;
				if (checkDecimalLimit(newSecondNum) && checkLengthLimit(newSecondNum)) {
					this.setData({
						secondNum: newSecondNum,
						calcExpression: `${firstNum}${operator}${newSecondNum}`,
						'bill.num': Number(newSecondNum)
					});
				} else if (!checkDecimalLimit(newSecondNum)) {
					// wx.showToast({ title: '小数点后最多两位', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			// 无运算符：往第一个操作数追加（如1）
			else {
				const newFirstNum = firstNum + key;
				if (checkDecimalLimit(newFirstNum) && checkLengthLimit(newFirstNum)) {
					this.setData({
						firstNum: newFirstNum,
						calcExpression: newFirstNum,
						'bill.num': Number(newFirstNum)
					});
				} else if (!checkDecimalLimit(newFirstNum)) {
					// wx.showToast({ title: '小数点后最多两位', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			return;
		}

		// ========== 2. 小数点处理 ==========
		if (key === '.') {
			// 有结果（如2）：往第二个操作数加小数点（如2+0.）
			if (result && operator) {
				const tempSecondNum = secondNum === '' ? '0.' : secondNum + '.';
				if (!secondNum.includes('.') && checkLengthLimit(tempSecondNum)) {
					this.setData({
						secondNum: tempSecondNum,
						calcExpression: `${result}${operator}${tempSecondNum}`,
						'bill.num': Number(tempSecondNum)
					});
				} else if (secondNum.includes('.')) {
					// wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			// 无结果，有运算符：往第二个操作数加小数点（如1+0.）
			else if (operator) {
				const tempSecondNum = secondNum === '' ? '0.' : secondNum + '.';
				if (!secondNum.includes('.') && checkLengthLimit(tempSecondNum)) {
					this.setData({
						secondNum: tempSecondNum,
						calcExpression: `${firstNum}${operator}${tempSecondNum}`,
						'bill.num': Number(tempSecondNum)
					});
				} else if (secondNum.includes('.')) {
					// wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			// 无运算符：往第一个操作数加小数点（如1.）
			else {
				const tempFirstNum = firstNum === '' ? '0.' : firstNum + '.';
				if (!firstNum.includes('.') && checkLengthLimit(tempFirstNum)) {
					this.setData({
						firstNum: tempFirstNum,
						calcExpression: tempFirstNum,
						'bill.num': Number(tempFirstNum)
					});
				} else if (firstNum.includes('.')) {
					// wx.showToast({ title: '一个数字只能有一个小数点', icon: 'none' });
				} else {
					// wx.showToast({ title: '输入不能超过8个字符', icon: 'none' });
				}
			}
			return;
		}

		// ========== 3. 核心：运算符处理（1+1→2+→2+3→5+ 逻辑） ==========
		if (/[+-]/.test(key)) {
			// 场景1：有完整运算式（如1+1、2+3）→ 先计算结果，再拼接新运算符
			if ((firstNum && operator && secondNum) || (result && operator && secondNum)) {
				const num1 = Number(result || firstNum) || 0;
				const num2 = Number(secondNum) || 0;
				const calcResult = operator === '+' ? num1 + num2 : num1 - num2;
				const fixedResult = parseFloat(calcResult.toFixed(2));

				// 核心：计算后直接拼接「结果+新运算符」（如2+、5+）
				this.setData({
					result: fixedResult.toString(), // 保存结果用于后续运算
					firstNum: '', // 清空第一个操作数，后续基于result运算
					secondNum: '', // 清空第二个操作数
					operator: key, // 新运算符
					calcExpression: `${fixedResult}${key}`, // 2+ / 5+
					'bill.num': fixedResult
				});
				return;
			}

			// 场景2：只有结果（如2）→ 直接拼接「结果+新运算符」（2+）
			if (result) {
				this.setData({
					operator: key,
					calcExpression: `${result}${key}`,
					secondNum: '',
					'bill.num': Number(result)
				});
				return;
			}

			// 场景3：只有第一个操作数（如1）→ 拼接「第一个操作数+运算符」（1+）
			if (firstNum) {
				this.setData({
					operator: key,
					calcExpression: `${firstNum}${key}`,
					secondNum: '',
					'bill.num': Number(firstNum)
				});
				return;
			}

			// 场景4：无任何输入 → 提示
			// wx.showToast({ title: '请先输入数字', icon: 'none' });
		}
	},

	// ========== 4. 核心改造：等于按钮点击直接显示纯结果（1+1=→2） ==========
	async tapSubmit(evt) {
		const flag = evt.currentTarget.dataset.again; // 1=再记 2=等于
		const { firstNum, secondNum, operator, result } = this.data;
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/click.mp3', 1000);
		// 等于按钮核心逻辑：计算后直接显示纯结果
		if (flag === 2 && operator && secondNum) {

			const num1 = Number(result || firstNum) || 0;
			const num2 = Number(secondNum) || 0;
			const calcResult = operator === '+' ? num1 + num2 : num1 - num2;
			const fixedResult = parseFloat(calcResult.toFixed(2));

			// 核心：直接显示纯结果（如2），而非「1+1=2」
			this.setData({
				calcExpression: fixedResult.toString(), // 显示2
				result: fixedResult.toString(), // 保存结果用于后续运算
				firstNum: '',
				secondNum: '',
				operator: '',
				'bill.num': fixedResult
			});
			return;
		}

		// 记账提交逻辑（再记/完成）
		let submitAmount = Number(result || firstNum) || 0;
		submitAmount = parseFloat(submitAmount.toFixed(2));
		this.setData({ 'bill.num': submitAmount });

		if (submitAmount === 0) {

			wx.showToast({ title: '请先输入金额', icon: 'none' });
			return;
		}

		if (flag === 1) {
			await this.submitBill(false);

		} else if (flag === 2) {
			await this.submitBill(true);
			wx.showToast({ title: '记账成功', icon: 'none' });
		}
	},

	// ========== 5. 删除键逻辑 ==========
	tapDel() {
		const { firstNum, secondNum, operator, result, calcExpression } = this.data;
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/click.mp3', 1000);
		// 有结果（如2）→ 清空所有
		if (result && !operator && !secondNum) {
			this.initCalc();
			return;
		}
		// 有结果且有运算符和第二个操作数（如2+3）→ 删除第二个操作数最后一位
		else if (result && operator && secondNum) {
			const newSecondNum = secondNum.slice(0, -1);
			const newExp = newSecondNum ? `${result}${operator}${newSecondNum}` : `${result}${operator}`;
			this.setData({
				secondNum: newSecondNum,
				calcExpression: newExp,
				'bill.num': newSecondNum ? Number(newSecondNum) : Number(result)
			});
		}
		// 有结果且有运算符（如2+）→ 清空运算符，显示结果
		else if (result && operator) {
			this.setData({
				operator: '',
				calcExpression: result,
				'bill.num': Number(result)
			});
		}
		// 无结果，有运算符和第二个操作数（如1+1）→ 删除第二个操作数最后一位
		else if (operator && secondNum) {
			const newSecondNum = secondNum.slice(0, -1);
			const newExp = newSecondNum ? `${firstNum}${operator}${newSecondNum}` : `${firstNum}${operator}`;
			this.setData({
				secondNum: newSecondNum,
				calcExpression: newExp,
				'bill.num': newSecondNum ? Number(newSecondNum) : Number(firstNum)
			});
		}
		// 无结果，有运算符（如1+）→ 清空运算符，显示第一个操作数
		else if (operator) {
			this.setData({
				operator: '',
				calcExpression: firstNum,
				'bill.num': Number(firstNum)
			});
		}
		// 只有第一个操作数（如1）→ 删除最后一位
		else if (firstNum) {
			const newFirstNum = firstNum.slice(0, -1);
			this.setData({
				firstNum: newFirstNum,
				calcExpression: newFirstNum || '',
				'bill.num': newFirstNum ? Number(newFirstNum) : 0
			});
		}
	},

	// ========== 6. 长按删除 ==========
	longpressDel() {
		this.initCalc();
		if (this.delInterval) clearInterval(this.delInterval);
		this.delInterval = setInterval(() => this.tapDel(), 100);
	},

	// ========== 7. 停止长按删除 ==========
	stopInterval() {
		if (this.delInterval) {
			clearInterval(this.delInterval);
			this.delInterval = null;
		}
	},

	// ========== 8. 提交账单 ==========
	async submitBill(resetCalc = true) {
		const { bill } = this.data;

		// if (!this.data.doneFlag) {
		// 	wx.showToast({ title: '没有分类你点什么😠', icon: 'none' });
		// 	return;
		// }

		const data = {
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
			const res = await createTransaction(data);
			if (res.code === 200) {
				// playBtnAudio('/static/audio/save_bill.mp3', 1000);
				if (resetCalc) {
					wx.navigateBack({ delta: 1 })
				}

				else this.setData({ 'bill.remark': '', 'bill.tags': [] });
				this.initCalc();
			} else {
				wx.showToast({ title: res.msg || '记账失败', icon: 'none' });
			}
		} catch (error) {
			console.error('提交失败:', error);
			wx.showToast({ title: '网络异常，请重试', icon: 'none' });
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
		let res = await getCategoryList({ userId: userInfo.id, type: selectedTab + 1, ...queryParams, bookCategoryId: bookList[bookIndex].id })
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
		playBtnAudio('/static/audio/click.mp3', 1000);
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
		playBtnAudio('/static/audio/click.mp3', 1000);
		this.setData({
			selectedTab: index,
			'bill.transaction_type': this.data.swiperTabs[index].id
		})
		this.getCategoryListFn()
	},
	onTapTab(evt) {
		console.log(evt)
		const { sub } = evt.detail.delta
		// playBtnAudio('/static/audio/click.mp3', 1000);
		this.setData({
			selectedTab: sub,
			'bill.transaction_type': this.data.swiperTabs[sub].id
		})
		this.getCategoryListFn()
	},
	// 设置类别页面
	handleSettingCategory() {

		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.navigateTo({
			url: "/subPackages/pages/category/index?typeIndex=" + this.data.selectedTab,
			routeType: "wx://upwards"
		})
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