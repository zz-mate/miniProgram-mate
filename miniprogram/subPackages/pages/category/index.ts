// subPackages/pages/category/index.ts
import { getStorageSync } from '../../../utils/util';
import { COLOR } from '../../../utils/color.js';
import { getCategoryList, cateBindBill, deleteCate, getDeleteListCategoryList, removeListCategoryList } from '../../../api/category'
import { playBtnAudio } from '../../../utils/audioUtil'
// 定义常量，统一管理弹窗类型相关的key前缀
const POPUP_SHOW_KEY_PREFIX = 'showPopup_';
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight,
		shortcutTabHeight: 0,
		statusBarHeight: 0,
		swiperIndex: 1,
		typeList: [{ color: COLOR.incomeColor, name: '收入' }, { color: COLOR.theme, name: '支出' }],
		selectedTab: 0,
		swiperTabs: [
			{
				id: 1,
				title: '收入',
			},
			{
				id: 2,
				title: '支出',
			}
		],
		userInfo: null,
		categoryList: [],
		categoryDelList: [],
		queryParams: {
			page: 1,
			pageSize: 100
		},
		startX: '',
		startY: '',
		showPopup_hasBill: false,
		popupType: '',
		categoryId: ''
	},
	/**
 * 类别列表
 */
	async getCategoryListFn() {
		let { queryParams, selectedTab } = this.data
		let userInfo = getStorageSync("userInfo")
		// console.log(bookList, bookIndex, 123)
		let res = await getCategoryList({ userId: userInfo.id, type: selectedTab == 0 ? 1 : 2, ...queryParams, bookCategoryId: 1 })
		this.setData({
			categoryList: res.list,
			categoryIndex: 0
		})
		let ret = await getDeleteListCategoryList({ userId: userInfo.id, type: selectedTab == 0 ? 1 : 2, ...queryParams, bookCategoryId: 1 })
		this.setData({
			categoryDelList: ret.list,
			categoryDelIndex: 0
		})
	},
	getNavBarHeight() {
		const query = wx.createSelectorQuery();
		query.select('.shortcut').boundingClientRect()

		query.exec((res) => {
			if (res) {
				this.setData({
					shortcutTabHeight: res[0].height
				});
			}
		})

	},
	// 点击 remove 图标：展开当前项的删除按钮（隐藏其他项）
	handleShowDelete(e) {
		const { i } = e.currentTarget.dataset || {};
		if (i === undefined) return;

		// 深拷贝列表，避免直接修改原数据
		const newCategoryList = JSON.parse(JSON.stringify(this.data.categoryList));
		// 1. 先重置所有项的 status 为 true（隐藏删除按钮）
		newCategoryList.forEach(item => {
			item.status = true;
		});
		// 2. 单独将当前点击项的 status 设为 false（显示删除按钮）
		if (newCategoryList[i]) {
			newCategoryList[i].status = false;
		}
		playBtnAudio('/static/audio/click.mp3', 1000);
		// 更新数据
		this.setData({
			categoryList: newCategoryList
		});
	},

	// 触摸开始：记录起始坐标 + 重置所有项的状态
	touchS(e) {
		const { i } = e.currentTarget.dataset || {};
		if (i === undefined) return;

		// 深拷贝列表，重置所有项的 status 为 true
		const newCategoryList = JSON.parse(JSON.stringify(this.data.categoryList));
		newCategoryList.forEach(item => {
			item.status = true;
		});

		// 记录触摸起始坐标 + 更新列表
		this.setData({
			startX: e.touches[0].clientX,
			startY: e.touches[0].clientY,
			categoryList: newCategoryList
		});
	},

	// 触摸移动：根据滑动方向显示/隐藏删除按钮
	touchM(e) {
		// 容错：无触摸坐标直接返回
		if (!e.touches || e.touches.length === 0) return;

		const currentX = e.touches[0].clientX;
		const currentY = e.touches[0].clientY;
		const { i } = e.currentTarget.dataset || {};
		if (i === undefined) return;

		// 计算滑动距离
		const x = this.data.startX - currentX; // 左滑为正，右滑为负
		const y = Math.abs(this.data.startY - currentY); // 纵向滑动距离

		// 深拷贝列表
		const newCategoryList = JSON.parse(JSON.stringify(this.data.categoryList));

		// 仅处理横向滑动（纵向滑动超过110则忽略，避免误触）
		if (y < 110) {
			if (x > 35) {
				// 左滑超过35px：显示删除按钮
				newCategoryList[i].status = false;
			} else if (x < -35) {
				// 右滑超过35px：隐藏删除按钮
				newCategoryList[i].status = true;
			}
		}

		// 更新列表
		this.setData({
			categoryList: newCategoryList
		});
	},

	async deleteList(e) {
		try {
			playBtnAudio('/static/audio/click.mp3', 1000);
			wx.vibrateShort({ type: 'light' })
			// 1. 安全获取要删除的 id 和 dataset 中的索引（关键：需要 index/i 定位列表项）
			let { id } = e.currentTarget.dataset || {};
			this.setData({
				categoryId: id
			})
			// 2. 构造请求参数
			let data = {
				currentUserId: getStorageSync("userInfo")?.id || "", // 加容错，防止 userInfo 不存在
				categoryId: id,
			};
			// 容错：检查 userId 是否存在
			if (!data.currentUserId) {
				wx.showToast({ title: "用户信息异常，请重新登录", icon: "none" });
				return;
			}

			// 3. 调用删除接口
			let res = await cateBindBill(data);
			console.log(res)
			if (res.code === 200 && res.hasBill) {
				this.setData({
					showPopup_hasBill: res.hasBill,
				})
			} else {
				// let data = {
				// 	categoryId: this.data.categoryId,
				// 	currentUserId: getStorageSync("userInfo")?.id || "",
				// 	deleteBill: true
				// }
			let res = 	await deleteCate({...data,deleteBill: true})
			if(res.code==200){
				wx.showToast({
					title:"移除成功",icon:'none'
				})
				this.getCategoryListFn()
			}
			}
		} catch (error) {
			// 捕获异常，避免代码崩溃
			console.error("删除接口调用异常：", error);
			wx.showToast({ title: "网络异常，删除失败", icon: "none" });
		}
	},
	async handleRemoveCate() {
		playBtnAudio('/static/audio/click.mp3', 1000);
			wx.vibrateShort({ type: 'light' })
		let data = {
			categoryId: this.data.categoryId,
			currentUserId: getStorageSync("userInfo")?.id || "",
			deleteBill: true
		}
	let res = 	await deleteCate(data)
	if(res.code==200){
		wx.showToast({
			title:res.message,icon:'none'
		})
		this.getCategoryListFn()
	}
	},
	onTapTab(evt) {
		const { sub } = evt.detail.delta
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		this.setData({
			selectedTab: sub,
			// : this.data.swiperTabs[sub].id
		})
		this.getCategoryListFn()
	},
	// 添加类别
	async handleAddCate(evt) {
		playBtnAudio('/static/audio/click.mp3', 1000);
		// wx.vibrateShort({ type: 'light' })
		let userInfo = getStorageSync("userInfo")
		let data = {
			categoryDeleteId: evt.currentTarget.dataset.id, currentUserId: userInfo.id, categoryId: evt.currentTarget.dataset.category_id
		}
		let res = await removeListCategoryList(data)
		if (res.code == 200) {
			wx.showToast({
				title: "添加成功",
				icon: "none"
			})
			this.getCategoryListFn()
		}

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
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ typeIndex }) {
		this.setData({
			selectedTab: typeIndex
		})
		this.getNavBarHeight()
		this.getCategoryListFn()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.setData({
			userInfo: getStorageSync("userInfo")
		})
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