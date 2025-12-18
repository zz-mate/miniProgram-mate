

import { getTransactionList } from '../../api/transaction'
import { getBookList, getBookInfo } from '../../api/book'
import { budgetInfo } from '../../api/budget'
import { COLOR } from '../../utils/color.js';
import {getThisDate} from '../../utils/util'


import { getStorageSync, setStorageSync } from '../../utils/util';


import { showHideTabBar } from '../../utils/tabbar'
import SystemConfig from '../../utils/capsule';

const token = getStorageSync('token') || null

export enum RefreshStatus {
	Idle,
	CanRefresh,
	Refreshing,
	Completed,
	Failed,
	CanTwoLevel,
	TwoLevelOpening,
	TwoLeveling,
	TwoLevelClosing,
}

const systemInfo = wx.getSystemInfoSync()
const { shared, Easing, spring, timing, runOnJS } = wx.worklet
const EasingFn = Easing.cubicBezier(0.4, 0.0, 0.2, 1.0)

const lerp = function (begin, end, t) {
	'worklet'
	return begin + (end - begin) * t
}

const clamp = function (cur, lowerBound, upperBound) {
	'worklet'
	if (cur > upperBound) return upperBound
	if (cur < lowerBound) return lowerBound
	return cur
}

const secondFloorCover = 'https://env-00jxubueh4pn.normal.cloudstatic.cn/miniProgram/istockphoto-2187165494-612x612.jpg'
// 'https://res.wx.qq.com/op_res/6Wt8f05P0Icnti4PBLtxfxza5VkItUCF1dQ6clDNr6c9KJxvxQMzWmJdkKXqHjOFjLp2fQAPV0JG1X6DwqGjyg'


Component({
	pageLifetimes: {
		show: function () {
			// 页面被展示
			this.getTabBar().setData({ selected: 0 })
			let token = getStorageSync("token")
			this.setData({
				token
			})
			if (!token) return
			this.handleBookList()
			this.setData({
				userInfo: getStorageSync("userInfo"),
			})

		},
		hide: function () {
			// 页面被隐藏
		},
		resize: function (size) {
			// 页面尺寸变化
		}
	},
	data: {
		token,
		eyeIndex: 1,
		duration: 300,
		closedElevation: 1,
		closedBorderRadius: 8,
		openElevation: 4,
		openBorderRadius: 0,

		paddingTop: 44,
		renderer: 'skyline',

		categoryItemWidth: 0,
		intoView: '',
		selected: 0,
		padding: [0, 10, 0, 10],
		triggered: false,
		twoLevelTriggered: false,
		isTwoLevel: false,
		refreshStatus: '下拉刷新',
		secondFloorCover,

		show: false,
		scrollBackTop: 0,

		capsuleHeight: 0,
		// fakNavBarHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		deviceType: '',
		safeAreaInset: { top: 0, bottom: 0 },

		percent: 100,
		income_percent: 8,
		disburse_percent: 100,

		showCard: false,

		queryParams: {
			start_time:'',
			page: 1,
			pageSize: 100,
		},
		total: 0,
		totalPages: 0,
		transactionList: [],
		dailySummary: [],
		summary: {
			expendTotalMoney: '0.00', incomeTotalMoney: '0.00', surplusTotalMoney: '0.00',
			monthText: '', yearText: ''
		},
		userInfo: null,
		bookList: [],
		bookInfo: {
			budget_usage_percent: 0,
			budget_status_code: 1,
		},

		budgetInfo: null
	},

	lifetimes: {

		ready() {

		},
		created() {
			this.initSystemConfig();
			this.navBarOpactiy = shared(1)
			this.showCard = shared(false)
			this.fakNavBarHeight = shared(0)
		},
		attached() {
			const padding = 10 * 2
			const categoryItemWidth = (systemInfo.windowWidth - padding) / 5
			this.getNavBarHeight()
			this.setData({ categoryItemWidth, paddingTop: systemInfo.statusBarHeight, renderer: this.renderer })



			this.applyAnimatedStyle('.nav-bar', () => {
				'worklet'
				return {
					backgroundColor: (this.navBarOpactiy.value > 0 && this.renderer == 'skyline') ? 'transparent;' : 'rgba(255,255,255,1)',//'rgba(255,255,255,1);',
					backdropFilter: (this.navBarOpactiy.value > 0 && this.renderer == 'skyline') ? ' blur(0px);' : '  blur(6px);'
				}
			})

			this.applyAnimatedStyle('.sticky-card', () => {
				'worklet'
				return {
					opacity: this.showCard.value ? 1 : 0,
					transform: this.showCard.value ? 'translateY(0)' : 'translateY(20px)',
					visibility: this.showCard.value ? 'visible' : 'hidden',
					transition: 'all 0.3s ease'
				}
			})

			wx.createSelectorQuery()
				.select('#scrollview')
				.node()
				.exec((res) => {
					this.scrollContext = res[0].node;
				})

		},
	},



	created() {
		let token = getStorageSync("token")
		if (!token) return
		this.handleBookList()
	},
	methods: {
		/**
		 * 切换眼睛展示金额
		 */
		handleEye(evt) {
			const { eye } = evt.currentTarget.dataset
			// const { summary } = this.data
			this.setData({
				eyeIndex: eye == 1 ? 2 : 1,
				// 'summary.expendTotalMoney': eye == 1 ? '****' :'0.00'|| summary.expendTotalMoney,
				// 'summary.incomeTotalMoney': eye == 1 ? '****' : '0.00'|| summary.incomeTotalMoney,
				// 'summary.surplusTotalMoney': eye == 1 ? '****' :'0.00'||  summary.surplusTotalMoney
			})

		},
		/**
		 * 账本列表
		 */
		async handleBookList() {
			let token = getStorageSync("token")
			if (!token) return
			let data = {
				userId: getStorageSync("userInfo").id,

			}
			let res = await getBookList(data)
			let list = res.list

			if (list.length == 0) return
			let bookInfo = list.find(ele => {
				return ele.is_default == 1
			});
			this.setData({
				bookInfo,
				bookList: list
			})
		


			setStorageSync("bookList", res.list)
			this.handleBookInfo()
		},
		/**
		 * 默认选中当前账本
		 */
		async handleBookInfo() {
			let data = {
				userId: getStorageSync("userInfo").id,
				bookId: this.data.bookInfo.id,
				is_default: 1
			}
			let res = await getBookInfo(data)
			setStorageSync("bookInfo", res.data)
			this.getBudgetInfo(data.bookId, data.userId)
			this.setData({
				bookInfo: res.data
			})
			// this.handleTransactionList()
		},
		/**
		 * 预算详情
		 */
		async getBudgetInfo(bookId, userId) {
			const {start_time} = this.data.queryParams
				console.log(start_time)
			let data = {
				bookId, userId,
				// "year": 2025,
				// "month": 12
			}
			let res = await budgetInfo(data)
			this.setData({
				budgetInfo: res.data
			})
			this.handleTransactionList()
		},
		/**
		 * 流水列表
		 */
		async handleTransactionList() {
			let data = {
				userId: getStorageSync("userInfo").id,
				bookId: this.data.bookInfo.id,
				...this.data.queryParams,
				start_time:getThisDate('YY-MM')
			}

			let res: any = await getTransactionList(data)
			this.setData({
				transactionList: res.list.dataList[0].children,
				dailySummary: res.dailySummary,
				summary: res.summary,
				queryParams: {
					page: res.pagination.page,
					pageSize: res.pagination.pageSize,
				},
				total: res.pagination.total,
				totalPages: res.pagination.totalPages
			})
			// const calendar = this.selectComponent('#calendar');
			// if (calendar) {
			// 	calendar.createDays(2025, 12);
			// }
		},


		// 获取导航栏高度
		getNavBarHeight() {
			const query = wx.createSelectorQuery();
			query.select('.nav-bar').boundingClientRect();
			query.select('.fake-nav-bar').boundingClientRect();
			query.select('.bill-list').boundingClientRect();

			query.select('.budget-card').boundingClientRect();
			query.exec((res) => {
				if (res) {
					const navBarHeight = res[0].height;
					const fakNavBarHeight = res[1].height
					this.fakNavBarHeight.value = res[1].height

					this.setData({
						navBarHeight: navBarHeight,
					});
					// sticky-content
				}
			})

		},
		//  初始化系统配置
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
		// 刷新系统信息
		refreshSystemInfo() {
			SystemConfig.refreshSystemInfo();
			this.initSystemConfig();

			wx.showToast({
				title: '系统信息已刷新',
				icon: 'success'
			});
		},

		// 返回顶部
		handleBackTop() {
			this.setData({
				scrollBackTop: 0
			})
		},
		handleSetting() {
			wx.vibrateShort({ type: 'heavy' })
			wx.navigateTo({
				url: "/subPackages/pages/budget/index?bookId=" + this.data.bookInfo.book_id,
				routeType: "wx://upwards"
			})
		},
		/************************************* */
		handleScrollStart(evt) {
			'worklet'
		},
		handleScroll(evt) {
			console.log(evt)
		},
		handleScrollUpdate(evt) {
			'worklet'
			const maxDistance = 50  //search 距离顶部过渡距离
			const scrollTop = clamp(evt.detail.scrollTop, 0, maxDistance)
			const progress = EasingFn(scrollTop / maxDistance)
			console.log(this.fakNavBarHeight.value, evt.detail.scrollTop)
			const shouldShowCard = evt.detail.scrollTop >= this.fakNavBarHeight.value
			runOnJS(this.updateShowCard.bind(this))(shouldShowCard)


			this.navBarOpactiy.value = lerp(1, 0, progress)
		},

		handleScrollEnd(evt) {
			'worklet'
		},

		onPulling(e) {

		},
		/************************************* */
		updateShowCard(show) {
			this.setData({
				showCard: show
			})
		},
		onRefresh() {
			if (this._freshing) return
			this._freshing = true

			let token = getStorageSync("token")
			if (!token) return
			this.handleBookList()




			this.setData({
				triggered: false,
			})
			this._freshing = false
			// setTimeout(() => {
			//   this.setData({
			//     triggered: false,
			//   })
			//   this._freshing = false
			// }, 2000)
		},

		onRestore(e) {

		},

		onAbort(e) {
			console.log('onAbort', e)
		},

		closeTwoLevel() {
			this.setData({
				twoLevelTriggered: false,
			})
		},

		onStatusChange(e) {
			const status: RefreshStatus = e.detail.status
			const twoLevelModes = [RefreshStatus.TwoLevelOpening, RefreshStatus.TwoLeveling, RefreshStatus.TwoLevelClosing]
			const isTwoLevel = twoLevelModes.indexOf(status) >= 0
			const refreshStatus = this.buildText(status)
			this.setData({
				isTwoLevel,
				refreshStatus,
			})
			if (status === RefreshStatus.TwoLevelOpening) {
				showHideTabBar();
			}


			if (status === RefreshStatus.TwoLeveling) {
				const that = this
				wx.navigateTo({
					url: '/pages/secondFloor/secondFloor',
					events: {
						nextPageRouteDone: function (data) {
							showHideTabBar(true)
							that.scrollContext.closeTwoLevel({
								duration: 1
							})
						}
					},
					success(res) { }
				})
			}
		},

		buildText(status: RefreshStatus) {
			switch (status) {
				case RefreshStatus.Idle:
					return '下拉刷新'
				case RefreshStatus.CanRefresh:
					return '松手刷新'
				case RefreshStatus.Refreshing:
					return '正在刷新'
				case RefreshStatus.Completed:
					return '刷新成功'
				case RefreshStatus.Failed:
					return '刷新失败'
				case RefreshStatus.CanTwoLevel:
					return '松手进入二楼'
				default:
					return '进入二楼'
			}
		},
		// 进入账本页面
		handleBookPage() {
			const token = wx.getStorageSync('token') || null
			wx.vibrateShort({
				type: 'heavy'
			})
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			}
			//  else {
			// 	wx.vibrateShort({ type: 'heavy' })
			// 	wx.navigateTo({
			// 		url: "/pages/home/book/index",
			// 		routeType: "wx://upwards"
			// 	})
			// }

		},
		// 记一笔
		handleCreate() {
			let { bookInfo, bookList } = this.data
			let bookIndex = bookList.findIndex(ele => ele.book_id == bookInfo.book_id)
			const token = wx.getStorageSync('token') || null
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			} else {
				wx.vibrateShort({ type: 'heavy' })
				wx.navigateTo({
					url: "/subPackages/pages/transaction/add/index?bookIndex=" + bookIndex,
					routeType: "wx://upwards"
				})
			}
		},
		// 跳转到账单详情页面
		handleTransactionInfo(evt) {
			const { transaction_id, transaction_type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'heavy' })
			wx.navigateTo({
				url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
			})
		},
		// 跳转到日历账单页面
		handleCalenderPage() {
			wx.vibrateShort({ type: 'heavy' })
			wx.navigateTo({
				url: `/subPackages/pages/transaction/calendar/index`
			})
		},
		// 跳转明细页面
		handleBillPage(){
			wx.vibrateShort({ type: 'heavy' })
			wx.navigateTo({
				url: `/subPackages/pages/transaction/bill/index`
			})
		},
		//组件监听事件 跳转到添加账单
		select(e) {
			let { bookInfo, bookList } = this.data
			let bookIndex = bookList.findIndex(ele => ele.book_id == bookInfo.book_id)
			const token = wx.getStorageSync('token') || null
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			} else {
				wx.vibrateShort({ type: 'heavy' })
				wx.navigateTo({
					url: "/subPackages/pages/transaction/add/index?bookIndex=" + bookIndex + '&date=' + e.detail,
					routeType: "wx://upwards"
				})
			}
		},
		// 金刚区 跳转
		handlePageUrl(evt){
			const {url} = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'heavy' })
			console.log(url)
			wx.navigateTo({url})
		},
		onShareAppMessage() { }
	},

})
