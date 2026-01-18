import { getTransactionList, removeTransaction } from '../../api/transaction'
import { getBookList, getBookInfo, getBookUserList, bindJoinBook, shareBook } from '../../api/book'
import { budgetInfo } from '../../api/budget'
import { playBtnAudio } from '../../utils/audioUtil'
import { getThisDate } from '../../utils/util'
import { getStorageSync, setStorageSync } from '../../utils/util';
import { showHideTabBar } from '../../utils/tabbar'
import SystemConfig from '../../utils/capsule';

const token = getStorageSync('token') || null
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';
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

Component({
	// 关键1：启用页面级生命周期，才能监听 onLoad 接收分享参数
	pageLifetimes: {
		show: function () {
			this.getTabBar().setData({ selected: 0 })
			this.setData({
				userInfo: getStorageSync("userInfo"),
			})
			app.onLoginSuccess(() => {
				console.log('回调触发！执行handleBookList');
				this.handleBookList();
			});
		},
		hide: function () { },
		resize: function (size) { },
		// 新增：页面加载时接收分享参数（核心）
		load: function (options) {
			// 捕获分享链接中的 userId 和 bookId
			const { userId: shareUserId, bookId: shareBookId, type } = options || {};
			if (shareUserId && shareBookId && type) {
				console.log('接收的分享参数：', { shareUserId, shareBookId });
				// 1. 存入组件 data，供后续使用
				this.setData({
					shareUserId,
					shareBookId
				});
				// 2. 可选：存入缓存，防止数据丢失
				setStorageSync('shareParams', { shareUserId, shareBookId });
				// 3. 可选：执行业务逻辑（比如加入该账本）

				this.handleBindJoinSharedBook(shareUserId, shareBookId);
			}
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
		startY: '',
		showPopup_together: false,
		popupType: '',
		bookUserList: [],
		// 关键2：新增字段存储分享参数
		shareUserId: '', // 分享者ID
		shareBookId: ''  // 分享的账本ID
	},

	lifetimes: {
		ready() { },
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
					backgroundColor: (this.navBarOpactiy.value > 0 && this.renderer == 'skyline') ? 'transparent;' : 'rgba(255,255,255,1)',
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
		// 关键3：新增方法 - 处理加入分享账本的业务逻辑
		async handleBindJoinSharedBook(shareBookId: string) {
			try {
				const currentUserId = getStorageSync("userInfo")?.id;
				if (!currentUserId) {
					wx.showToast({ title: '请先登录', icon: 'none' });
					return;
				}
				// 示例：调用加入账本接口（根据你的实际接口调整）
				const res = await bindJoinBook({
					userId: currentUserId,
					shareBookId
				});
				if (res.code === 200 && !res.data.hasRecord) {

					wx.showToast({ title: '成功加入分享的账本', icon: "none" });
					// // 重新拉取账本列表和当前账本信息
					this.handleBookList();
				}
			} catch (err) {

				wx.showToast({ title: '网络异常', icon: 'none' });
			}
		},

		// 原有方法保持不变...
		handleLoginAndFetch() {
			try {
				app.onLoginSuccess(() => {
					this.handleBookList();
				});
				app.login();
			} catch (err) {
				console.error('登录失败：', err);
			}
		},

		touchS(e) {
			console.log(e)
			let { transactionList, startX, startY } = this.data
			let { index, i } = e.currentTarget.dataset || {};
			if (transactionList[index] && transactionList[index].list[i]) {
				console.log('当前触摸项的status：', transactionList[index].list[i].status)
			}
			const newTransactionList = JSON.parse(JSON.stringify(transactionList));
			newTransactionList.forEach((item) => {
				if (item.list && Array.isArray(item.list)) {
					item.list.forEach((subItem) => {
						if (typeof subItem === 'object' && subItem !== null) {
							subItem.status = true;
						}
					});
				}
			});
			this.setData({
				startX: e.touches[0].clientX,
				startY: e.touches[0].clientY,
				transactionList: newTransactionList
			}, () => {
				console.log('响应式更新完成：');
				console.log('触摸坐标：', this.data.startX, this.data.startY);
				console.log('指定项status（更新后）：', transactionList[index]?.list[i]?.status);
			});
		},
		touchM(e) {
			if (!e.touches || e.touches.length === 0) return;
			var currentX = e.touches[0].clientX;
			var currentY = e.touches[0].clientY;
			const x = this.data.startX - currentX;
			const y = Math.abs(this.data.startY - currentY);
			let { index, i } = e.currentTarget.dataset || {};
			const newTransactionList = JSON.parse(JSON.stringify(this.data.transactionList));
			if (newTransactionList[index] && newTransactionList[index].list[i]) {
				if (x > 35 && y < 110) {
					newTransactionList[index].list[i].status = false;
				} else if (x < -35 && y < 110) {
					newTransactionList[index].list[i].status = true;
				}
			}
			this.setData({
				transactionList: newTransactionList,
			}, () => {
				console.log('滑动后 status：', newTransactionList[index]?.list[i]?.status);
			});
		},
		async deleteList(e) {
			const notify = this.selectComponent('#customNotify');
			try {
				wx.vibrateShort({ type: 'light' })
				playBtnAudio('/static/audio/btnaudio.mp3', 1000);
				let { id } = e.currentTarget.dataset || {};
				if (!id) {
					wx.showToast({ title: "删除失败：缺少账单ID", icon: "none" });
					return;
				}
				let data = {
					userId: getStorageSync("userInfo")?.id || "",
					bookId: getStorageSync("bookInfo")?.id || "",
					billId: id
				};
				if (!data.userId) {
					wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
					return;
				}
				let res = await removeTransaction(data);
				if (res.code === 200) {

					this.getBudgetInfo(data.bookId, data.userId)
					this.handleTransactionList()
					notify.showNotify({
						message: '删除成功',
						type: 'success',
						duration: 1500,
						position: 'bottom'
					});
				} else {
					wx.showToast({ title: res.msg || "删除失败", icon: "none" });
				}
			} catch (error) {
				console.error("删除接口调用异常：", error);
				wx.showToast({ title: "网络异常，删除失败", icon: "none" });
			}
		},
		handleEye(evt) {
			const { eye } = evt.currentTarget.dataset
			this.setData({
				eyeIndex: eye == 1 ? 2 : 1,
			})
		},
		async handleBookList() {
			let token = getStorageSync("token")
			if (!token) return
			let data = {
				userId: getStorageSync("userInfo").id,
			}
			let res = await getBookList(data)
			console.log(res)
			let list = res.data.singleBookList
			if (list.length == 0) return
			let bookInfo = list.find(ele => {
				return ele.is_default == 1
			});
			this.setData({
				bookInfo,
				bookList: list
			})
			setStorageSync("bookList", res.data.singleBookList)
			setStorageSync("multiBookList", res.data.multiBookList)
			this.handleBookInfo()
		},
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
				bookInfo: res.data,
			})
			this.handleTransactionList()
		},
		async getBudgetInfo(bookId, userId) {
			let data = {
				bookId, userId,
			}
			let res = await budgetInfo(data)
			this.setData({
				budgetInfo: res.data,
			})
			this.handleTransactionList()
		},
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
		},
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
		refreshSystemInfo() {
			SystemConfig.refreshSystemInfo();
			this.initSystemConfig();
			wx.showToast({
				title: '系统信息已刷新',
				icon: 'success'
			});
		},
		handleBackTop() {
			this.setData({
				scrollBackTop: 0
			})
		},
		handleSetting() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.navigateTo({
				url: "/subPackages/pages/budget/index?bookId=" + this.data.bookInfo.id,
				routeType: "wx://upwards"
			})
		},
		handleScrollStart(evt) {
			'worklet'
		},
		handleScroll(evt) {
			console.log(evt)
		},
		handleScrollUpdate(evt) {
			'worklet'
			const maxDistance = 50
			const scrollTop = clamp(evt.detail.scrollTop, 0, maxDistance)
			const progress = EasingFn(scrollTop / maxDistance)
			const shouldShowCard = evt.detail.scrollTop >= this.fakNavBarHeight.value
			runOnJS(this.updateShowCard.bind(this))(shouldShowCard)
			this.navBarOpactiy.value = lerp(1, 0, progress)
		},
		handleScrollEnd(evt) {
			'worklet'
		},
		onPulling(e) { },
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
		},
		onRestore(e) { },
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
		handleBookPage() {
			const token = wx.getStorageSync('token') || null
			// const userInfo = getStorageSync("userInfo")
			// if(userInfo.levelInfo.user_level<=3) return
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		handleCreate() {
			let { bookInfo, bookList } = this.data
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		handleTransactionInfo(evt) {
			const { transaction_id, transaction_type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/info/index?id=${transaction_id}&type=${transaction_type}`
			})
		},
		handleCalenderPage() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/calendar/index`
			})
		},
		handleBillPage() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.navigateTo({
				url: `/subPackages/pages/transaction/bill/index?date=` + getThisDate('YY-MM') + '&yearMonthMoreActive=2' + '&type=0'
			})
		},
		select(e) {
			let { bookInfo, bookList } = this.data
			let bookIndex = bookList.findIndex(ele => ele.book_id == bookInfo.book_id)
			const token = wx.getStorageSync('token') || null
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
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
		handlePageUrl(evt) {
			const { url, type } = evt.currentTarget.dataset
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			let param: string | number = ""
			if (type == 'bill') {
				param = getThisDate("YY") + '&yearMonthMoreActive=1&type=0&bookId=' + getStorageSync("bookInfo").id
			}
			wx.navigateTo({ url: url + '?date=' + param })
		},
		async getBookUserListFn() {
			let data = {
				userId: getStorageSync("userInfo").id,
				bookId: getStorageSync("bookInfo").id
			}
			let res = await getBookUserList(data)
			console.log(res)
			this.setData({
				bookUserList: res.list
			})
		},
		handleChildPopup(data: any) {
			let { delta, type } = data.detail
			if (!type) return;
			this.updatePopupStatus(type, !delta);
		},
		handlePopup(evt) {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			const { type } = evt.currentTarget.dataset;
			if (!type) return;
			this.getBookUserListFn()
			this.updatePopupStatus(type, true);
		},
		handleCloseOverlay() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			const { popupType } = this.data;
			if (!popupType) return;
			this.updatePopupStatus(popupType, false);
		},
		updatePopupStatus(type, show) {
			const key = `${POPUP_SHOW_KEY_PREFIX}${type}`;
			const data = {
				[key]: show
			};
			if (show) {
				data.popupType = type;
			}
			this.setData(data);
		},
		async handleInvite() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);

			let userId = getStorageSync("userInfo").id

			let bookId = getStorageSync("bookInfo").id
			let data = {
				shareUserId: userId,
				shareBookId: bookId,
				inviteeId: 0,

			}
			await shareBook(data)
			this.onShareAppMessage()
		},
		onShareAppMessage() {
			let nickname = getStorageSync("userInfo").nickname
			let userId = getStorageSync("userInfo").id
			let bookname = getStorageSync("bookInfo").name
			let bookId = getStorageSync("bookInfo").id
			console.log(nickname)
			let shareObj = {
				title: `${nickname}邀请您加入账本「${bookname}」`,
				imageUrl: "https://picsum.photos/200/200?random=1",
				path: '/pages/index/index?userId=' + userId + '&bookId=' + bookId + '&type=invite_book',
			}
			return shareObj
		}
	}
})