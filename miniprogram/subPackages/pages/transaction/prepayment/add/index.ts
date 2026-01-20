// pages/plan/index.ts
import { COLOR } from '../../../../../utils/color.js';
import { playBtnAudio } from '../../../../../utils/audioUtil'
import { createAppointment } from '../../../../../api/appointment'
import { getAccountList } from '../../../../../api/account'
import { isSubscribeBind, openSchedule, cancelSchedule } from '../../../../../api/subscribe'
import { getThisDate, getStorageSync, getCycleEndDate } from '../../../../../utils/util'
const dateUtils = require('../../../../../utils/dateutils')
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';

const formatCurrentDate = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 1).padStart(2, '0')}`;
};

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		switchOpenColor: COLOR.primary,
		navBgColor: COLOR.white,
		popupType: "",
		showPopup_book: false,
		showPopup_account: false,
		showPopup_category: false,
		showPopup_date: false,
		params: {
			name: "",
			accountId: "",
			amount: "0.00",
			billTime: "",
			remark: ""
		},
		queryParams: {
			page: 1,
			pageSize: 100
		},
		bookList: [],
		bookIndex: -1,
		accountList: [],//账户列表
		selectedParentIndex: -1, // 选中的父级索引
		selectedChildIndex: -1,   // 选中的子级索引
		categoryIndex: -1,
		categoryList: [],


		list: [
			{ id: 1, name: "明细", type: "bill", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768028733498-b6b7b1a1-d147-49e9-9cfd-0c671fcc6078.png", url: "/subPackages/pages/transaction/bill/index" },
			{ id: 2, name: "预算", type: "budget", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768028788001-9eb4ca57-3a45-45de-b1cd-63327981587e.png", url: "/subPackages/pages/transaction/budget/index" },
			{ id: 3, name: "资产", type: "account", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768028802397-eb86e910-7b17-4f06-9f43-00252d483655.png", url: "/pages/account/index" },
			{ id: 4, name: "日历", type: "calendar", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768028824109-0c574862-eaac-4a3c-b8ad-2563991aa63a.png", url: "/subPackages/pages/transaction/calendar/index" },
			{ id: 5, name: "预约转账", type: "pprepayment", icon: "http://oss-api.zz-mate.cn/uploads/2026/01/1768028547998-0b1ce8c1-51d7-4eb2-a607-ef25c060c62a.png", url: "/subPackages/pages/transaction/prepayment/index" }
		],
		startDateLimit: '',
		// 周期结束弹窗控制
		showCycleEndPopupFlag: false,
		cycleEndFilterList: [
			{ id: 1, type: "YMD", name: "长期有效" },
			{ id: 2, type: "YMD", name: "一年后" },
			{ id: 3, type: "YMD", name: "半年后" },
			//  { id: 4, type: "default", name: "自定义" }
		],
		cycleEndInfo: {
			activeIndex: 0,
			defaultDate: formatCurrentDate(),
			displayDate: '长期有效',
			actualDate: ""
		},

		// 周期开始弹窗控制
		showCycleStartPopupFlag: false,
		cycleStartFilterList: [
			{ id: 1, type: "YMD", name: "仅一次", cycle_type: 0 },
			{ id: 2, type: "WEEK", name: "每周", cycle_type: 3 },
			{ id: 3, type: "D", name: "每月", cycle_type: 2 },
			{ id: 4, type: "MD", name: "每年", cycle_type: 1 },
		],
		cycleStartPickerMode: 'date', // date/week
		cycleStartInfo: {
			activeIndex: 0,
			defaultDate: '',
			displayDate: '选择日期',
			extraText: '',
			selectedName: "",
			actualDate: ""
		},
		backParams: {
			type: 2
		},
		isSaveBtnDisabled: true,
		checked: false
	},
	/**
	 * switch状态切换
	 */
	async changeCheck(res) {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		if (!res.detail.checked) {
			// await this.getcancelSchedule()
		} else {
			// await openSchedule({
			// 	openid: wx.getStorageSync('userInfo').openid,
			// 	subscribeType: "xiaoFei",
			// 	"sendTime": this.data.params.billTime
			// });
		}

		// wx.getSetting({
		// 	withSubscriptions: true, // 请求中包含订阅消息的选项
		// 	success (res) {
		// 		if (res.authSetting['scope.subscribeMessage']) {
		// 			// 用户已经授权了订阅消息
		// 			console.log('用户已授权订阅消息');
		// 			// 接下来可以调用 wx.requestSubscribeMessage 获取具体的订阅消息状态
		// 			wx.requestSubscribeMessage({
		// 				tmplIds: ['hzWciRDNcqtdvd5-ndh0A4PFNr9wCfWQpr6UG-ZdjpY'], // 模板ID列表，这里需要替换为实际使用的模板ID
		// 				success (res) {
		// 					console.log('订阅消息请求成功', res);
		// 				},
		// 				fail (err) {
		// 					console.log('订阅消息请求失败', err);
		// 				}
		// 			});
		// 		} else {
		// 			// 用户未授权订阅消息
		// 			console.log('用户未授权订阅消息');
		// 		}
		// 	},
		// 	fail (err) {
		// 		console.log('获取设置失败', err);
		// 	}
		// });
			this.subscribeTargetTemplate(res.detail.checked)
		

	},
	// 单独封装请求具体模板订阅的逻辑
 subscribeTargetTemplate (checked) {
  // 模板ID列表，可根据业务场景动态传入
  const tmplIds = ['hzWciRDNcqtdvd5-ndh0A4PFNr9wCfWQpr6UG-ZdjpY'];
  let that = this
  wx.requestSubscribeMessage({
    tmplIds: tmplIds,
    success (res) {
      console.log('订阅消息请求成功', res);
			that.setData({
				checked: checked
			})
      // 遍历模板ID，检查每个模板的订阅状态
      tmplIds.forEach(tmplId => {
        if (res[tmplId] === 'accept') {
          wx.showToast({
            title: '订阅成功',
            icon: 'success'
          });
        } else if (res[tmplId] === 'reject') {
          wx.showToast({
            title: '你拒绝了该模板订阅',
            icon: 'none'
          });
        } else if (res[tmplId] === 'ban') {
          wx.showToast({
            title: '该模板已被封禁',
            icon: 'none'
          });
        }
      });
    },
    fail (err) {
      console.log('订阅消息请求失败', err);
			that.setData({
				checked: false
			})
      // 常见失败原因：用户未授权、模板ID无效、小程序未配置模板
      wx.showToast({
        title: '订阅失败，请重试',
        icon: 'none'
      });
    }
  });
},
	/**
	 * 校验预约转账必填项
	 * @returns {Object} { isValid: 是否通过, msg: 提示信息 }
	 */
	validateAppointmentForm() {
		const { params, backParams, cycleStartInfo } = this.data;
		console.log(params)
		// 1. 校验账户ID
		if (!params.accountId) {
			return { isValid: false, msg: "请选择账户" };
		}

		// 2. 校验账本ID
		if (!backParams.bookId) {
			return { isValid: false, msg: "请选择账本" };
		}

		// 3. 校验金额（大于0的有效数字）
		const amount = Number(params.amount);
		if (!params.amount || isNaN(amount) || amount <= 0) {
			return { isValid: false, msg: "请输入有效的转账金额" };
		}

		// 4. 校验预约时间（周期开始的实际日期 + 时间）
		if (!cycleStartInfo.actualDate || !params.billTime) {
			return { isValid: false, msg: "请选择预约时间" };
		}

		// 5. 校验备注（非空）
		if (!params.remark || params.remark.trim() === "") {
			return { isValid: false, msg: "请填写备注信息" };
		}

		// 所有校验通过
		return { isValid: true, msg: "" };
	},
	/**
	 * 更新保存按钮状态（可点击/不可点击）
	 */
	updateSaveBtnStatus() {
		const { isValid } = this.validateAppointmentForm();
		this.setData({
			isSaveBtnDisabled: !isValid
		});
	},
	bindKeyInputMoney(e) {
		this.setData({
			'params.amount': e.detail.value
		})
		// 新增：更新按钮状态
		this.updateSaveBtnStatus();
	},
	bindKeyInputRemark(e) {
		this.setData({
			'params.remark': e.detail.value
		})
		// 新增：更新按钮状态
		this.updateSaveBtnStatus();
	},

	handleAddAsset() {
		wx.navigateTo({
			url: "/subPackages/pages/account/list/index"
		})
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
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		if (!type) return; // 增加类型校验，避免空值操作
		this.setData({
			popupType: `${POPUP_SHOW_KEY_PREFIX}${type}`
		})
		if (type == 'date') {
		} else if (type == 'account') {
			this.handleAccountList()
		} else if (type == 'book') {

			// this.handleBookList()
		} else if (type == 'category') {

			// if (this.data.params.bookCategoryId == "") {
			// 	wx.showToast({
			// 		title: "选择账本",
			// 		icon: "none"
			// 	})
			// 	return
			// }
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
		console.log(popupType)
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
	// 获取账本列表
	// async handleBookList() {
	// 	let data = {
	// 		userId: getStorageSync('userInfo').id
	// 	}
	// 	let res = await getBookList(data)
	// 	this.setData({
	// 		bookList: res.data.singleBookList,
	// 	})
	// },
	// 选择账本
	// handleBookSelected(evt) {
	// 	const { index } = evt.currentTarget.dataset
	// 	wx.vibrateShort({ type: 'light' })
	// 		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
	// 	this.setData({
	// 		'params.bookId': this.data.bookList[index].id,
	// 		'params.bookCategoryId': this.data.bookList[index].book_category_id,
	// 		bookIndex: index
	// 	})
	// },
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
	handleAccountDefault() {
		this.setData({
			selectedParentIndex: -1,
			selectedChildIndex: -1
		});

		this.setData({
			'params.accountId': ""
		})
	},

	/**
 *  处理账户选择事件
 */
	handleChooseAccount(e) {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		// 获取点击事件传递的索引数据
		const { parentIndex, childIndex } = e.currentTarget.dataset;
		// 更新选中状态
		this.setData({
			selectedParentIndex: parentIndex,
			selectedChildIndex: childIndex
		});

		// 如果你需要获取选中的数据
		const selectedItem = this.data.accountList[parentIndex]?.children[childIndex];
		this.setData({
			'params.accountId': selectedItem.id,
		})
		// 新增：更新按钮状态
		this.updateSaveBtnStatus();
	},
	handlePageUrl() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.navigateTo({
			url: "/subPackages/pages/transaction/prepayment/bookCate/index",
			routeType: "wx://upwards"
		})
	},
	/**
* 类别列表
*/
	// async getCategoryListFn() {
	// 	let { params, queryParams } = this.data
	// 	let userId = getStorageSync("userInfo").id
	// 	let bookCategoryId = getStorageSync("bookInfo").book_category_id
	// 	let data = { userId: userId, type: params.transactionType, ...queryParams, bookCategoryId }

	// 	let res = await getCategoryList(data)
	// 	this.setData({
	// 		categoryList: res.list,
	// 		categoryIndex: 0,
	// 	})
	// },
	/**
 * 选择类别  服饰 日用 交通 
 */
	// handleChooseCategory(e) {
	// 	wx.vibrateShort({ type: 'light' })
	// 	playBtnAudio('/static/audio/btnaudio.mp3', 1000);
	// 	let { index } = e.currentTarget.dataset

	// 	this.setData({
	// 		categoryIndex: index,
	// 		'params.categoryId': this.data.categoryList[index].id
	// 	})
	// },

	handleSave() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			popupType: ""
		})
	},
	async handleAppointmentSave() {

		if (this.data.isSaveBtnDisabled) return;

		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);

		// 1. 先执行表单校验
		const validateResult = this.validateAppointmentForm();
		if (!validateResult.isValid) {
			wx.showToast({
				title: validateResult.msg,
				icon: 'none',
				duration: 2000
			});
			return;
		}

		// const notify = this.selectComponent('#customNotify');

		let userInfo = getStorageSync("userInfo")
		let { params, cycleStartInfo, cycleStartFilterList, cycleEndInfo, backParams } = this.data
		let data = {
			user_id: userInfo.id,
			account_id: params.accountId,
			category_id: backParams.categoryId,
			book_id: backParams.bookId,
			expense_amount: params.amount,
			cycle_exec_rule:cycleStartInfo.defaultDate,
			appointment_time: cycleStartInfo.activeIndex == 0 ?  cycleStartInfo.actualDate + ' ' + params.billTime: params.billTime,
			cycle_type: cycleStartFilterList[cycleStartInfo.activeIndex].cycle_type,
			cycle_rule: cycleStartFilterList[cycleStartInfo.activeIndex].name,
			cycle_end_time: cycleEndInfo.activeIndex == 0 ? cycleStartInfo.actualDate + ' ' + params.billTime:  params.billTime,
			expense_type: backParams.type,
			remark: params.remark,
			creator: userInfo.nickname
		}
		console.log(JSON.stringify(data))
		// return
		let res = await createAppointment(data)
		console.log(res)
		if (res.code == 200) {
			// notify.showNotify({
			// 	message: "添加成功",
			// 	type: 'success',
			// 	duration: 1500
			// });
			wx.navigateBack({ delta: 1 })
		} else {
			const notify = this.selectComponent('#customNotify');
			notify.showNotify({
				message: res.message,
				type: 'error',
				duration: 1500
			});
		}
	},
	// 截止
	onEndFilterTap(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const filterData = e.detail;
		console.log('筛选选项点击结果END：', filterData);
		let cycleEndInfo = {
			activeIndex: filterData.index,
			defaultDate: filterData.presetDate,
			displayDate: filterData.selectedDate,
			extraText: filterData.name
		}

		this.setData({
			cycleEndInfo
		});
	},
	/**
	 * 显示周期结束弹窗
	 */
	showCycleEndPopup() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({ showCycleEndPopupFlag: true });
	},

	/**
	 * 显示周期开始弹窗
	 */
	showCycleStartPopup() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const activeIndex = this.data.cycleStartInfo.activeIndex;
		const type = this.data.cycleStartFilterList[activeIndex]?.type || 'YMD';

		// 映射type到选择器模式
		const modeMap = {
			'YMD': 'date',
			'WEEK': 'week',
			'D': 'date',
			'MD': 'date'
		};

		this.setData({
			cycleStartPickerMode: modeMap[type],
			showCycleStartPopupFlag: true
		});
	},

	/**
	 * 关闭周期结束弹窗
	 */
	closeCycleEndPopup() {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({ showCycleEndPopupFlag: false });
	},

	/**
	 * 关闭周期开始弹窗
	 */
	closeCycleStartPopup() {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({ showCycleStartPopupFlag: false });
	},

	/**
	 * 周期结束确认事件
	 */
	onCycleEndConfirm(e) {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { activeIndex, selectedDate } = e.detail;
		console.log(e)
		this.setData({
			cycleEndInfo: {
				activeIndex,
				defaultDate: selectedDate,
				displayDate: selectedDate,
			}
		});
		this.closeCycleEndPopup();
		console.log('周期结束筛选结果：', e.detail);
	},
	// 开始筛选事件
	onStartFilterTap(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const filterData = e.detail;


		let cycleStartInfo = {
			activeIndex: filterData.index,
			defaultDate: filterData.selectedDate,
			displayDate: filterData.selectedDate,
			selectedName: filterData.name
		}

		this.setData({
			cycleStartInfo,

		});
	},
	/**
	 * 周期开始确认事件
	 */
	onCycleStartConfirm(e) {
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { activeIndex, selectedDate, displayDate, selectedName, actualDate } = e.detail;
		// console.log(e)
		this.setData({
			cycleStartInfo: {
				...this.data.cycleStartInfo,
				activeIndex,
				defaultDate: selectedDate,
				displayDate,
				selectedName,
				actualDate
			}
		});
		this.closeCycleStartPopup();
		this.updateSaveBtnStatus();
		console.log('周期开始筛选结果：', e.detail);
	},




	// async getIsSubscribeBind() {
	// 	let data = {
	// 		"openid": getStorageSync("userInfo").openid,
	// 		"template_id": "hzWciRDNcqtdvd5-ndh0A4PFNr9wCfWQpr6UG-ZdjpY"
	// 	}
	// 	let res = await isSubscribeBind(data)
	// 	return res.data
	// },
	// async getcancelSchedule() {
	// 	let data = {
	// 		"openid": getStorageSync("userInfo").openid,
	// 		"subscribeType": "xiaoFei"
	// 	}
	// 	let res = await cancelSchedule(data)
	// 	return res.data
	// },

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
	async onShow() {
		// let checked = await this.getIsSubscribeBind()
		let remark = ''
		if (this.data.backParams?.categoryName) {
			if (this.data.backParams?.type == 1) {
				remark = '收入' + this.data.backParams?.categoryName
			} else {
				remark = '支出' + this.data.backParams?.categoryName
			}
		}
		// :this.data.backParams?.type==1?'收入 '+  this.data.backParams?.categoryName:'支出 '+  this.data.backParams?.categoryName || ''
		this.setData({
			'params.billTime': dateUtils.formatLongTime(new Date(), dateUtils.modeMapToFields['hm']),
			startDateLimit: getThisDate("YY-MM-DD", 1),
			'cycleStartInfo.defaultDate': getThisDate("YY-MM-DD", 1),
			endDate: getThisDate("YY-MM-DD"),
			'params.remark': remark,
			// checked
		})
		// if (this.data.backParams) {
		//   console.log("接收的返回参数：", this.data.backParams);
		//   // 执行业务逻辑，如刷新列表、更新选中状态
		//   // this.loadData();
		// 	this.setData({
		// 		backParams:
		// 	})
		// }
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