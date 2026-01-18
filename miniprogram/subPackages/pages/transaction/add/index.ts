// subPackages/pages/transaction/add/index.ts
import { playBtnAudio } from '../../../../utils/audioUtil'
import { getStorageSync, findAccountIndexes } from '../../../../utils/util';
import { getAccountList } from '../../../../api/account'
import { getCategoryList } from '../../../../api/category'
import { getBookList } from '../../../../api/book'
import { createTransaction, transactionInfo } from '../../../../api/transaction'

import { COLOR } from '../../../../utils/color.js';
import SystemConfig from '../../../../utils/capsule';
import { uploadFile } from '../../../../utils/upload'; // 路径根据你的项目结构调整
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
		billId: null,
		bookList: [],
		bookIndex: 0,
		selectedTab: 1,// 默认支出

		userInfo: null,
		isAnimate: false, // 动画开关
		intoView: '',
		swiperHeight: 0,
		swiperIndex: 1,
		swiperTabs: [
			{
				id: 1,
				title: '收入',
				type: 1
			},
			{
				id: 2,
				title: '支出',

				type: 2
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
			billId: null,// 账单id
			account_id: null,//账户id
			account_name: null,//账户名称
			num: 0, //金额
			transaction_type: 2, //类型1-收入 2-支出  3-转账 4-借贷
			refound: false,// 退款 true 默认 false
			categoryId: 1, //分类id
			remark: '', //备注
			tags: [],
			image_list: "",
			date: '',  //日期
			address: "",
			longitude: "",
			latitude: ""
		},
		imagesHeight: 0,
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
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		let submitAmount = Number(result || firstNum) || this.data.bill.num;
		submitAmount = parseFloat(submitAmount.toFixed(2));
		this.setData({ 'bill.num': submitAmount });

		if (submitAmount === 0 && !this.data.billId) {

			wx.showToast({ title: '请先输入金额', icon: 'none' });
			return;
		}

		if (flag === 1) {
			await this.submitBill(false);

		} else if (flag === 2) {
			await this.submitBill(true);
			// wx.showToast({ title: '记账成功', icon: 'none' });
		}

	},

	// ========== 5. 删除键逻辑 ==========
	tapDel() {
		const { firstNum, secondNum, operator, result, calcExpression } = this.data;
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		const { bill, billId } = this.data;

		// if (!this.data.doneFlag) {
		// 	wx.showToast({ title: '没有分类你点什么😠', icon: 'none' });
		// 	return;
		// }

		const data = {
			'billId': billId,
			"user_id": getStorageSync("userInfo").id,
			"consume_user_id": getStorageSync("userInfo").id,
			"account_id": bill.account_id,
			"book_id": this.data.bookInfo?.id,
			"category_id": this.data.categoryList[this.data.categoryIndex].id,
			"type": bill.transaction_type,
			"amount": Number(Math.abs(bill.num)),
			"currency": "CNY",
			"tags": JSON.stringify(bill.tags),
			"image_list": bill.image_list,
			"bill_time": bill.date.replace(/\//g, '-') + ':00',
			"remark": bill.remark,
			address: bill.address,
			longitude: bill.longitude,
			latitude: bill.latitude
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
		query.select('.image-list').boundingClientRect();
		query.exec((res) => {
			if (res) {
				let imagesHeight = res[3].height || 0
				this.setData({
					calculatorHeight: res[0].height,
					tabMoneyCardHeight: res[1].height,
					keyboardHeadHeight: res[2].height,
					imagesHeight
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
		wx.vibrateShort({ type: 'light' });
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { type } = evt.currentTarget.dataset;
		if (!type) return; // 增加类型校验，避免空值操作

		if (type == 'date') {
			const date = this.data.bill.date
			this.setData({
				date: date ? new Date(date).getTime() : new Date().getTime(),
			})
		} else if (type == 'account') {
			// wx.vibrateShort({ type: 'light' })
			// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			this.handleAccountList()
		} else if (type == 'book') {
			this.handleBookList()
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

	/**
	 * 关闭选择日期
	 */
	onConfirmDate(e) {
		let mode = this.data.mode;
		let date = e.detail.date;
		// console.log('选中的时间戳：', e);
		// console.log('格式化日期：', e.detail.value); // 例：2026-01-01

		let renderTime = dateUtils.formatLongTime(date, dateUtils.modeMapToFields[mode]);
		console.log(renderTime)
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
			userId: getStorageSync('userInfo').id
		}
		let res = await getAccountList(data)

		this.setData({
			accountList: res.list
		})
	},
	/**
	 *  处理账户选择事件
	 */
	handleChooseAccount(e) {
		// 获取点击事件传递的索引数据
		const { parentIndex, childIndex } = e.currentTarget.dataset;
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		// 更新选中状态
		this.setData({
			selectedParentIndex: parentIndex,
			selectedChildIndex: childIndex
		});

		// 如果你需要获取选中的数据
		const selectedItem = this.data.accountList[parentIndex]?.children[childIndex];
		this.setData({
			'bill.account_id': selectedItem.id,
			'bill.account_name': selectedItem.name
		})
		// 这里可以添加其他业务逻辑，比如回调、数据提交等
	},
	handleAccountDefault() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		let { userInfo, queryParams, bookList, bookIndex, bill } = this.data
		let data = { userId: userInfo.id, type: bill.transaction_type, ...queryParams, bookCategoryId: bookList[bookIndex].book_category_id }

		let res = await getCategoryList(data)
		this.setData({
			categoryList: res.list,
			categoryIndex: 0,
			doneFlag: res.list.length > 0 ? true : false
		})
		if (this.data.billId) {
			let data = {
				userId: getStorageSync("userInfo").id,
				billId: this.data.billId,
			}
			this.getTransactionInfo(data)
		}
	},
	/**
	 * 选择类别  服饰 日用 交通 
	 */
	handleChooseCategory(e) {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let { index } = e.currentTarget.dataset

		this.setData({
			categoryIndex: index,
			selectedCategoryTags: [],
			isAnimate: true
		})

		setTimeout(() => {
			this.setData({ isAnimate: false });
		}, 500);
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
	async getTransactionInfo({ userId, billId }) {

		let res = await transactionInfo({ userId, billId })
		console.log(res)

		let data = {
			billId: res.data.id,// 账单id
			account_id: res.data.account.id,//账户id
			account_name: res.data.account.id == 0 ? '账户' : res.data.account.name,//账户名称
			num: Number(res.data.amount), //金额
			transaction_type: this.data.bill.transaction_type, //类型1-收入 2-支出  3-转账 4-借贷
			refound: false,// 退款 true 默认 false
			categoryId: res.data.category.id, //分类id
			remark: res.data.remark, //备注
			tags: res.data.tags,
			image_list: res.data.image_list,
			address: this.data.bill.address ? this.data.bill.address : res.data.address,
			date: res.data.bill_time, //日期
			latitude: this.data.bill.latitude ? this.data.bill.latitude : res.data.latitude,
			longitude: this.data.bill.longitude ? this.data.bill.longitude : res.data.longitude

		}
		const categoryIndex = this.data.categoryList.findIndex(ele => ele.id == data.categoryId)
		let indexResult = findAccountIndexes(this.data.accountList, data.account_id)
		this.setData({
			selectedParentIndex: indexResult.parentIndex,
			selectedChildIndex: indexResult.childIndex,
			bill: data, categoryIndex: categoryIndex < 0 ? 0 : categoryIndex,
			calcExpression: res.data.amount
		})
	},

	/**
	 * 切换类型
	 */
	onTabChanged(evt: any) {
		const index = evt.detail.current
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			selectedTab: index,
			'bill.transaction_type': this.data.swiperTabs[index].id
		})
		this.getCategoryListFn()
	},
	onTapTab(evt) {
		const { sub } = evt.detail.delta
		this.setData({
			selectedTab: sub,
			'bill.transaction_type': this.data.swiperTabs[sub].id
		})
		this.getCategoryListFn()
	},
	// 设置类别页面
	handleSettingCategory() {

		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.navigateTo({
			url: "/subPackages/pages/category/index?typeIndex=" + this.data.selectedTab,
			routeType: "wx://upwards"
		})
	},
	upload() {
		// 1. 选择图片（可选择相册/拍照）
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.chooseMedia({
			count: 1, // 仅选择1张图片
			mediaType: ['image'], // 只选图片类型
			sourceType: ['album', 'camera'], // 支持相册和拍照
			success: (res) => {
				// 获取选中图片的临时路径
				const tempFilePath = res.tempFiles[0].tempFilePath;
				// 2. 上传图片到服务器
				this.uploadToServer(tempFilePath);
			},
			fail: (err) => {
				console.error('选择图片失败：', err);
			}
		});
	},

	async uploadToServer(filePath: string) {
		const uploadRes = await uploadFile({
			url: '/common/upload/single', // 你的后端上传接口路径
			filePath: filePath, // 图片临时路径
			name: 'file', // 后端接收文件的key（默认是file，可根据后端要求改）
			formData: {
				// 额外的参数（如手机号、用户ID等），按需添加
				// phone: '13800138000',
				// userId: '123456',
			},
			showLoading: true, // 显示上传中loading（默认true，可省略）
		});


		this.setData({
			'bill.image_list': uploadRes.data.url
		})
		this.getNavBarHeight()

	},
	// 图片预览函数
	previewImage(e) {

		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		try {
			// 获取当前要预览的图片地址
			const currentImgUrl = this.data.bill.image_list;

			// 校验图片地址是否有效
			if (!currentImgUrl || currentImgUrl.trim() === '') {
				wx.showToast({
					title: '暂无图片可预览',
					icon: 'none'
				});
				return;
			}

			// 调用小程序预览图片接口
			wx.previewImage({
				current: currentImgUrl, // 当前显示的图片链接
				urls: [currentImgUrl],  // 需要预览的图片链接列表（支持多张）
				// 可选：预览时的回调
				success: () => {
					console.log('图片预览成功');
				},
				fail: (err) => {
					wx.showToast({
						title: '预览失败，请重试',
						icon: 'none'
					});
				}
			});
		} catch (error) {
			console.error('预览图片异常：', error);
			wx.showToast({
				title: '预览出错',
				icon: 'none'
			});
		}
	},
	deleteImage() {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })

		this.setData({
			'bill.image_list': ""
		})
		this.getNavBarHeight()
	},



	getLocation() {
		let that = this
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })

		wx.getLocation({
			type: 'gcj02', //返回可以用于wx.openLocation的经纬度
			// altitude: true, //传入 true 会返回高度信息，由于获取高度需要较高精确度，会减慢接口返回速度
			success: function (res) {
				console.log(res, '地图')
				wx.chooseLocation({
					latitude: res.latitude,
					longitude: res.longitude,
					success: function (r) {
						console.log(r)

						// r = { //返回的r数据字段为
						//   address: "江苏省南京市雨花台区雨花南路2号",
						//   errMsg: "chooseLocation:ok",
						//   latitude: 31.98115,
						//   longitude: 118.793015,
						//   name: "南京市雨花台区人民政府北(雨花南路南)"
						// }
						that.setData({
							'bill.address': r.address,
							'bill.latitude': r.latitude,
							'bill.longitude': r.longitude
						})
					},
					fail: function (err) {
						console.log(err);
					},
				})
			}
		})
	},

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
			'bill.date': options.date || this.data.bill.date,
			'bill.transaction_type': options.type ? options.type : 2,
			billId: options.billId,
			selectedTab: options.type ? Number(options.type) - 1 : 1,

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
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		this.initSystemConfig();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		console.log(dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['YMDhm']))
		this.setData({
			bookList: getStorageSync("bookList"),
			bookInfo: getStorageSync("bookInfo"),
			userInfo: getStorageSync("userInfo"),
			'bill.date': dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['YMDhm'])
		})
		this.getCategoryListFn()
		this.handleAccountList()
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