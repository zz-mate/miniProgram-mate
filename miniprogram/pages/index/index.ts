
import { getBookList } from '../../api/book'
import { getNavIconList } from '../../api/nav'
import { getBillList } from '../../api/bill'
import { getCurrentBudget } from '../../api/budget'
import { playBtnAudio } from '../../utils/audioUtil'
import { getStorageSync, setStorageSync } from '../../utils/util';
import SystemConfig from '../../utils/capsule';

interface BookItem {
	id: string;
	bookType: string;
	bookTypeInfo: {
		code: string;
		value: string;
		label: string;
	};
	bookMode: string;
	bookModeInfo: {
		code: string;
		value: string;
		label: string;
	};
	bookName: string;
	icon: string;
	bookDesc: string;
	isDefault: number;
	status: number;
	isCollapse?: boolean;
}

interface NavIconItem {
	id: number;
	iconName: string;
	icon: string;
	route: string;
	sort: number;
	remark: string;
	status: number;
}

interface BillItem {
	id: string;
	bookId: string;
	billType: string;
	billCode: string;
	amount: number;
	billTime: string;
	remark: string;
	icon: string;
	category: {
		id: string;
		name: string;
		icon: string;
	};
	consumer: {
		id: number;
		nickname: string;
		avatar: string | null;
	};
	type: number;
}

interface BillListData {
	list: Array<{
		month: string;
		day: string;
		weekday: string;
		incomeMoney: number;
		expendMoney: number;
		list: BillItem[];
	}>;
	total: number;
}

interface BudgetItem {
	id: number;
	userId: number;
	budgetYear: number;
	budgetMonth: number;
	totalBudget: string;
	totalUsed: string;
	totalRemain: string;
	icon: string;
	totalProgress?: number;
}

const systemInfo = wx.getSystemInfoSync()
const { shared, Easing, runOnJS } = wx.worklet
const EasingFn = Easing.cubicBezier(0.4, 0.0, 0.2, 1.0)
const app = getApp<IAppOption>()
const lerp = function (begin, end, t) {
	'worklet'
	return begin + (end - begin) * t
}

const clamp = function (cur, lowerBound, upperBound) {
	'worklet'
	return cur > upperBound ? upperBound : cur < lowerBound ? lowerBound : cur
}

Component({
	pageLifetimes: {
		show: function () {
			const tabBar = this.getTabBar()
			if (tabBar) {
				tabBar.setData({ selected: 0 })
			}
		},
		hide: function () { },
		resize: function () { },
	},

	lifetimes: {
		ready() {
			console.log('index page ready')
			// 监听 app 初始化完成事件
			wx.eventCenter && wx.eventCenter.on('appReady', () => {
				console.log('收到 appReady 事件')
				this.handleBookList();
				this.handleNavIconList();
			});
			// 立即调用一次（页面后加载的情况）
			this.handleBookList();
			this.handleNavIconList();
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

	data: {
		eyeIndex: 1,
		paddingTop: 44,
		renderer: 'skyline',
		categoryItemWidth: 0,
		selected: 0,
		triggered: false,
		userInfo: null,
		bookList: [] as BookItem[],
		bookInfo: {} as BookItem,
		navIconList: [] as NavIconItem[],
		billList: { data: { list: [] as any[], total: 0 } },
		budgetInfo: null as BudgetItem | null,
		scrollBackTop: 0,
		capsuleHeight: 0,
		navBarHeight: 0,
		statusBarHeight: 0,
		deviceType: '',
		safeAreaInset: { top: 0, bottom: 0 },
	},

	methods: {
		/**
		 * 处理账本列表
		 */
		async handleBookList() {
			let res = await getBookList();
			console.log('请求账本列表接口返回：', res);
			if (res && res.data && Array.isArray(res.data)) {
				res.data.forEach((item) => {
					item.isCollapse = true;
				})
				const bookList = res.data as unknown as BookItem[];
				const bookInfo = bookList.find(item => item.isDefault === 1) as BookItem;
				this.setData({
					bookList,
					bookInfo
				})
				setStorageSync("bookList", bookList)
				// 获取账单列表
				this.handleBillList();
				// 获取当月预算
				this.handleBudget();
			}
		},

		/**
		 * 获取导航图标列表
		 */
		async handleNavIconList() {
			let res = await getNavIconList();
			console.log('请求导航列表接口返回：', res);
			if (res && res.data && Array.isArray(res.data)) {
				this.setData({
					navIconList: res.data
				})
			}
		},

		/**
		 * 获取账单列表
		 */
		async handleBillList() {
			const { bookInfo } = this.data;
			if (!bookInfo || !bookInfo.id) return;
			let res = await getBillList({ bookId: bookInfo.id });
			console.log('请求账单列表接口返回：', res);
			res.data.list.forEach((item) => {
				item.list.forEach((billItem) => {
					billItem.isCollapse = true;
				})
			})
			if (res && res.data) {
				this.setData({
					billList: res.data.list || []
				})
			}
		},

		/**
		 * 获取当月预算
		 */
		async handleBudget() {
			let res = await getCurrentBudget();
			console.log('请求当月预算接口返回：', res);
			if (res && res.data) {
				this.setData({
					budgetInfo: res.data
				})
			}
		},

		handleTransactionInfo(evt) {
			console.log(evt)
			const { transaction_id, transaction_type } = evt.currentTarget.dataset
			 wx.navigateTo({
					url: "/subPackages/pages/transaction/info/index?id=" + transaction_id + "&billType=" + transaction_type
				})
		},
		handleEye(evt) {
			const { eye } = evt.currentTarget.dataset
			this.setData({
				eyeIndex: eye == 1 ? 2 : 1,
			})
		},

		onRefresh() {
			if (this._freshing) return
			this._freshing = true
			let token = getStorageSync("token")
			if (!token) return
			this.handleBookList();
			this.setData({
				triggered: false,
			})
			this._freshing = false
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

		updateShowCard(show) {
			this.setData({
				showCard: show
			})
		},

		getNavBarHeight() {
			const query = wx.createSelectorQuery();
			query.select('.nav-bar').boundingClientRect();
			query.select('.fake-nav-bar').boundingClientRect();
			query.exec((res) => {
				if (res) {
					const navBarHeight = res[0].height;
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

		handleBackTop() {
			this.setData({
				scrollBackTop: 0
			})
		},

		handleBookPage() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.navigateTo({
				url: "/subPackages/pages/book/index",
				routeType: "wx://upwards"
			})
		},

		handlePageUrl(evt) {
			const { url } = evt.currentTarget.dataset
			if (url) {
				wx.navigateTo({ url })
			}
		},
	}
})
