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
		bookIndex: 0 as number,
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
		minScale: 10, // 时间选择器分钟刻度



		accountList: [],//账户列表
		selectedParentIndex: -1, // 选中的父级索引
		selectedChildIndex: -1,   // 选中的子级索引

		categoryIndex: 0,
		categoryList: [],
		queryParams: {
			page: 1,
			pageSize: 100
		},

		selectedCategoryTags: [] as any
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


	onTapTab(evt) {
		const { tab, type } = evt.currentTarget.dataset || {}
		console.log(type)
		this.setData({
			selectedTab: tab,
			'bill.transaction_type': type
		})
		this.getCategoryListFn()
	},

	/**
	 * 点击键盘上的数字
	 */
	tapKey(event) {
		wx.vibrateShort({ type: 'light' })
		let key = event.currentTarget.dataset.key; //获取点击的数字 
		let num = this.data.bill.num; //获取当前数值
		let hasDot = this.data.hasDot; //获取是否有无小数点

		num = Number(num + key)
		if (num < 100000000) {
			num = "" + Math.floor(num * 100) / 100; //保留两位小数
			if (key == '.') {
				if (hasDot) return; //防止用户多次输入小数点
				num = num + "."
				this.setData({
					hasDot: true
				})
			}
		} else if (isNaN(num)) {
			//格式错误
			return;
		}
		this.setData({
			'bill.num': num == '0' ? key : num
		})
	},
	/**
	* 点击退格
	*/
	tapDel() {
		let num = "" + this.data.bill.num; //转为字符串，因为要用到字符串的截取方法

		if (num == '0') {
			return;
		}

		if (num.charAt(num.length - 1) == '.') {
			this.setData({
				hasDot: false //不设置false无法再次输入小数点
			})
		}

		this.setData({
			'bill.num': num.length == 1 ? '0' : num.substring(0, num.length - 1)
		})
	},


	/**
 * 保存账单
 */
	async tapSubmit(evt) {
		wx.vibrateShort({ type: 'heavy' })
		const flag = evt.currentTarget.dataset.again
		let bill = this.data.bill;
		// if (bill.num == '0') {
		//   wx.showToast({
		//     title: '😝花了多少钱写一下吧~',
		//     icon: "none"
		//   })
		//   return;
		// }
		console.log(this.data.selectedCategoryTags)
		let data = {
			"user_id": getStorageSync("userInfo").id,
			"consume_user_id": getStorageSync("userInfo").id,
			"account_id": bill.account_id,
			"book_id": this.data.bookInfo?.id,
			"category_id": this.data.categoryList[this.data.categoryIndex].id,
			"type": bill.transaction_type,
			"amount": Number(bill.num),
			"currency": "CNY",
			"tags": JSON.stringify(bill.tags),
			"bill_time": bill.date.replace(/\//g, '-') + ':00',
			"remark": bill.remark
		}
		console.log(data)
		// return
		let res = await createTransaction(data)
		if (res.code == 200) {
			wx.showToast({
			  title: '记账成功',
			  icon:"none"
			})
			// setTimeout(() => {
			if (flag == 1) {
				this.setData({
					categoryIndex: 0,
					'bill.tags': [],
					'bill.remark': '',
					'bill.num':0,
					'bill.date': dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['YMDhm'])
				})
			} else {
				wx.navigateBack({ delta: 1 })
			}

			// }, 600);
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
			const systemInfo = wx.getSystemInfoSync();
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
		query.select('.keyboard-row').boundingClientRect();
		query.select('.keyboard-bottom3').boundingClientRect();
		query.select('.tab-list').boundingClientRect();
		query.select('.money-content').boundingClientRect();

		query.exec((res) => {
			if (res) {
				this.setData({
					calculatorHeight: res[0].height + res[1].height,
					tabMoneyCardHeight: res[2].height + res[3].height,
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
			// this.getCategoryListFn()
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
			bookInfo: bookList[index]
		})
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
		let { userInfo, selectedTab, queryParams } = this.data
		let res = await getCategoryList({ userId: userInfo.id, type: selectedTab + 1, ...queryParams })
		this.setData({
			categoryList: res.list,
			categoryIndex: 0
		})
	},
	/**
	 * 选择类别  服饰 日用 交通 
	 */
	handleChooseCategory(e) {
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
		const systemInfo = wx.getSystemInfoSync();
		this.setData({
			safeAreaBottom: systemInfo.screenHeight - systemInfo.safeArea.bottom,
			bookIndex: Number(options.bookIndex),
			'bill.date': options.date || this.data.bill.date
		});
		// 提前在onLoad中就开始监听
		this.initKeyboardListener();
	},
	/**
 * 生命周期函数--监听页面卸载
 */
	onUnload() {
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