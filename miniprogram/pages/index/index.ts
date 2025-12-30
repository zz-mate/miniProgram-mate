

import { getTransactionList, removeTransaction } from '../../api/transaction'
import { getBookList, getBookInfo } from '../../api/book'
import { playBtnAudio } from '../../utils/audioUtil'
import { getThisDate } from '../../utils/util'


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
const app = getApp<IAppOption>()
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

const secondFloorCover = 'https://env-00jxubueh4pn.normal.cloudstatic.cn/5c9cda3274fc0 (1).jpg?expire_at=1766918614&er_sign=a8af17568ab72553fe83ada3c78d4d3a'
// 'https://res.wx.qq.com/op_res/6Wt8f05P0Icnti4PBLtxfxza5VkItUCF1dQ6clDNr6c9KJxvxQMzWmJdkKXqHjOFjLp2fQAPV0JG1X6DwqGjyg'


Component({
	pageLifetimes: {
		show: function () {
			// 页面被展示
			this.getTabBar().setData({ selected: 0 })
			this.setData({
				userInfo: getStorageSync("userInfo"),
			})
			app.onLoginSuccess(() => {
				console.log('回调触发！执行handleBookList');
				this.handleBookList();
			});
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
			start_time: '',
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

		budgetInfo: null,
		startX: '',
		startY: ''
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
		// 方案2：async 版本（推荐）
		async handleLoginAndFetch() {
			try {
				app.onLoginSuccess(() => {
					this.handleBookList();
				});
				await app.login(); // 等待登录完成
			} catch (err) {
				console.error('登录失败：', err);
			}
		},
		touchS(e) {
			console.log(e)
			// 1. 解构数据，避免直接操作 this.data 原数据
			let { transactionList, startX, startY } = this.data

			// 2. 安全获取 dataset 中的 index 和 i，防止未定义报错
			let { index, i } = e.currentTarget.dataset || {};

			// 3. 安全访问嵌套数据，打印指定项的 status
			if (transactionList[index] && transactionList[index].list[i]) {
				console.log('当前触摸项的status：', transactionList[index].list[i].status)
			}

			// 4. 批量将 transactionList 中所有 list 项的 status 设为 true（核心新增逻辑）
			// 深拷贝原数组，避免直接修改 this.data 里的原数据
			const newTransactionList = JSON.parse(JSON.stringify(transactionList));
			// 遍历外层数组
			newTransactionList.forEach((item) => {
				// 检查内层 list 是否为有效数组
				if (item.list && Array.isArray(item.list)) {
					// 遍历内层 list，修改所有项的 status 为 true
					item.list.forEach((subItem) => {
						if (typeof subItem === 'object' && subItem !== null) {
							subItem.status = true;
						}
					});
				}
			});

			// 5. 统一通过 setData 响应式更新所有数据（坐标 + 列表）
			this.setData({
				startX: e.touches[0].clientX,  // 触摸起始X坐标
				startY: e.touches[0].clientY,  // 触摸起始Y坐标
				transactionList: newTransactionList  // 更新后的列表数据
			}, () => {
				// 可选：回调验证更新结果
				console.log('响应式更新完成：');
				console.log('触摸坐标：', this.data.startX, this.data.startY);
				console.log('指定项status（更新后）：', transactionList[index]?.list[i]?.status);
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
			const newTransactionList = JSON.parse(JSON.stringify(this.data.transactionList));

			// 5. 滑动逻辑判断 + 响应式修改 status
			// 适配 transactionList 嵌套结构：修改指定 index 下 list[i] 的 status
			if (newTransactionList[index] && newTransactionList[index].list[i]) {
				if (x > 35 && y < 110) {
					// 向左滑：显示删除 → status 设为 false
					newTransactionList[index].list[i].status = false;
				} else if (x < -35 && y < 110) {
					// 向右滑：隐藏删除 → status 设为 true
					newTransactionList[index].list[i].status = true;
				}
			}

			// 7. 响应式更新数据（核心：用新数据替换原数据）
			this.setData({
				transactionList: newTransactionList,
				// effective_carts: newEffectiveCarts, // 如需保留原逻辑可启用
			}, () => {
				// 可选：验证更新结果
				console.log('滑动后 status：', newTransactionList[index]?.list[i]?.status);
			});
		},
		async deleteList(e) {
			try {
				wx.vibrateShort({ type: 'light' })
				playBtnAudio('/static/audio/click.mp3', 1000);
				// 1. 安全获取要删除的 id 和 dataset 中的索引（关键：需要 index/i 定位列表项）
				let { id } = e.currentTarget.dataset || {};
				if (!id) {
					wx.showToast({ title: "删除失败：缺少账单ID", icon: "none" });
					return;
				}

				// 2. 构造请求参数
				let data = {
					userId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
					billId: id
				};
				// 容错：检查 userId 是否存在
				if (!data.userId) {
					wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
					return;
				}

				// 3. 调用删除接口
				let res = await removeTransaction(data);
				if (res.code === 200) {
					wx.showToast({ title: "删除成功", icon: "none" });
					this.handleTransactionList()
					// 4. 核心：更新本地 transactionList 数据，触发页面刷新
					// 深拷贝原列表，避免直接修改 this.data
					// const newTransactionList = JSON.parse(JSON.stringify(this.data.transactionList));

					// // 方式1：如果是删除外层数组的项（根据 index）
					// // newTransactionList.splice(index, 1);

					// // 方式2：如果是删除内层 list 的项（根据 index + i，适配你的嵌套结构）
					// if (newTransactionList[index] && newTransactionList[index].list) {
					// 	newTransactionList[index].list.splice(i, 1); // 从内层 list 中删除第 i 项
					// }

					// // 5. 响应式更新数据，触发页面渲染
					// this.setData({
					// 	transactionList: newTransactionList
					// }, () => {
					// 	console.log("列表已刷新，当前列表长度：", this.data.transactionList.length);
					// });
				} else {
					wx.showToast({ title: res.msg || "删除失败", icon: "none" });
				}
			} catch (error) {
				// 捕获异常，避免代码崩溃
				console.error("删除接口调用异常：", error);
				wx.showToast({ title: "网络异常，删除失败", icon: "none" });
			}
		},
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
			// this.getBudgetInfo(data.bookId, data.userId)
			this.setData({
				bookInfo: res.data
			})
			this.handleTransactionList()
		},
		/**
		 * 预算详情
		 */
		// async getBudgetInfo(bookId, userId) {
		// 	// const { start_time } = this.data.queryParams
		// 	let data = {
		// 		bookId, userId,
		// 		// "year": 2025,
		// 		// "month": 12
		// 	}
		// 	let res = await budgetInfo(data)
		// 	this.setData({
		// 		budgetInfo: res.data
		// 	})
		// 	this.handleTransactionList()
		// },
		/**
		 * 流水列表
		 */
		async handleTransactionList() {
			let data = {
				userId: getStorageSync("userInfo").id,
				bookId: this.data.bookInfo.id,
				...this.data.queryParams,
				start_time: getThisDate('YY-MM')
			}

			let res: any = await getTransactionList(data)
			this.setData({
				transactionList: res.list.dataList[0]?.children,
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
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.navigateTo({
				url: "/subPackages/pages/budget/index?bookId=" + this.data.bookInfo.id,
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
			// console.log(this.fakNavBarHeight.value, evt.detail.scrollTop)
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
					url: '/pages/tools/index',
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
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			}
			else {
				wx.navigateTo({
					url: "/subPackages/pages/book/index",
					routeType: "wx://upwards"
				})
			}

		},
		// 记一笔
		handleCreate() {
			let { bookInfo, bookList } = this.data
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			let bookIndex = bookList.findIndex(ele => ele.book_id == bookInfo.book_id)
			const token = wx.getStorageSync('token') || null
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			} else {
				wx.navigateTo({
					url: "/subPackages/pages/transaction/add/index?bookIndex=" + bookIndex,
					routeType: "wx://upwards"
				})
			}
		},
		// 跳转到账单详情页面
		handleTransactionInfo(evt) {
			const { transaction_id, transaction_type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
			})
		},
		// 跳转到日历账单页面
		handleCalenderPage() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/calendar/index`
			})
		},
		// 跳转明细页面
		handleBillPage() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/bill/index?date=` + getThisDate('YY-MM')+'&yearMonthMoreActive=2'+'&type=0'
			})
		},
		//组件监听事件 跳转到添加账单
		select(e) {
			let { bookInfo, bookList } = this.data
			let bookIndex = bookList.findIndex(ele => ele.book_id == bookInfo.book_id)
			const token = wx.getStorageSync('token') || null
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			if (!token) {
				wx.navigateTo({
					url: "/pages/login/index"
				})
			} else {
				wx.navigateTo({
					url: "/subPackages/pages/transaction/add/index?bookIndex=" + bookIndex + '&date=' + e.detail,
					routeType: "wx://upwards"
				})
			}
		},
		// 金刚区 跳转
		handlePageUrl(evt) {
			const { url, type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
			let param: string | number = ""
			if (type == 'bill') {
				param = getThisDate("YY")+'&yearMonthMoreActive=1&type=0'
			}
			wx.navigateTo({ url: url + '?date=' + param })
		},
		onShareAppMessage() { }
	},

})
