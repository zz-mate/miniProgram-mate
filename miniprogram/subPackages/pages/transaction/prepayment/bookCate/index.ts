// subPackages/pages/transaction/prepayment/bookCate/index.ts
// subPackages/pages/book/index.ts

const app = getApp()
import { getStorageSync, setStorageSync } from '../../../../../utils/util';
import { getCategoryList } from '../../../../../api/category'
import { COLOR } from '../../../../../utils/color.js';
import { playBtnAudio } from '../../../../../utils/audioUtil'
import SystemConfig from '../../../../../utils/capsule';
Component({
	// 组件所在页面的生命周期
	pageLifetimes: {
		show: function () {
			// let bookList =  getStorageSync('bookList')

			this.setData({
				bookList: getStorageSync('bookList') || [],
				userInfo:getStorageSync("userInfo")
			})
			// 页面被展示
		},

		hide: function () {
			// 页面被隐藏
		},
		resize: function (size) {
			// 页面尺寸变化
		}
	},
	// 组件的的生命周期
	lifetimes: {
		ready() {
			this.initSystemConfig()
			this.getNavBarHeight()	
			this.getCategoryListFn()
		},

		created: () => {
			// console.log(122);
			// console.log(app.globalData);	
				
		},
		attached: function () {
			// 在组件实例进入页面节点树时执行
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},

	},
	/**
 * 页面的初始数据
 */
	data: {
		// 顶部高度与底部高度
		height: app.globalData.systemInfo.autoheight + 70,
		swiperHpx:0,
		navBarHeight: 0,
		statusBarHeight: 0,
		swiperCurrent: 0,
		typeList: [{ color: COLOR.incomeColor, name: '收入',sub:1 }, { color: COLOR.theme, name: '支出' ,sub:2}],
		typeIndex:1,
		bookList: [],
		userInfo:null,

		categoryIndex: -1,
		categoryList: [],
		queryParams: {
			page: 1,
			pageSize: 100000
		},
	},
	
	methods: {
			/**
	 * 切换类型
	 */
	onTabChanged(evt: any) {
		const index = evt.detail.current
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			typeIndex: index,
		
		})
		this.getCategoryListFn()
	},
		handleChange(evt){
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
    this.setData({
			swiperCurrent:evt.detail.current,
		})
		this.getCategoryListFn()
		},
		onTapTab(evt) {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			const { sub } = evt.detail.delta
			console.log(sub)
			this.setData({
				typeIndex: sub
			})
			this.getCategoryListFn()
		},
			/**
	 * 选择类别  服饰 日用 交通 
	 */
	handleChooseCategory(e) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let { index ,id,icon,name} = e.currentTarget.dataset
		
		this.setData({
			categoryIndex: index,
		})

		 // 1. 获取上一页的页面实例（getCurrentPages() 是小程序内置方法，返回页面栈数组）
		 const pages = getCurrentPages();
		 // 页面栈最后一个是当前页，倒数第二个是上一页
		 const prevPage = pages[pages.length - 2];
	 
		 // 2. 给上一页的 data 设置参数（可自定义字段名）
		 prevPage.setData({
			 // 示例参数：根据你的业务替换
			 backParams: {
				 categoryId:id ,
				 categoryIcon:icon,
				 categoryName:name,
				 type:this.data.typeList[this.data.typeIndex].sub,
				 bookId:this.data.bookList[this.data.swiperCurrent].id,
				 message: "获取分类id，账本id成功"
			 },
		 });

		wx.navigateBack({delta:1})
	},
			/**
	 * 类别列表
	 */
	async getCategoryListFn() {
		let { userInfo, queryParams,typeList,typeIndex, bookList, swiperCurrent } = this.data
		let data = { userId: userInfo.id, type:typeList[typeIndex].sub, ...queryParams, bookCategoryId: bookList[swiperCurrent].book_category_id }

		let res = await getCategoryList(data)
		this.setData({
			categoryList: res.list,
			categoryIndex: 0,
			doneFlag: res.list.length > 0 ? true : false
		})

	},


		getNavBarHeight() {
			const query = wx.createSelectorQuery();
			query.select('.head_swiper').boundingClientRect();
			query.select('.subsection').boundingClientRect();
			query.exec((res) => {
				if (res) {
					this.setData({
						swiperHpx: res[0].height+res[1].height,
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

		// 分享
		onShareAppMessage() {

		}
	},

})
