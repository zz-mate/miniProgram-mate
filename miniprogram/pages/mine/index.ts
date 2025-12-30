// pages/mine/index.ts
import { getStorageSync, setStorageSync, getThisDate } from '../../utils/util';
import { getUserById } from '../../api/user';
import { playBtnAudio } from '../../utils/audioUtil'
import SystemConfig from '../../utils/capsule';
import { COLOR } from '../../utils/color.js';
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.theme,
		navBarHeight: 0,
		statusBarHeight: 0,
		deviceType: '',
		safeAreaInset: { top: 0, bottom: 0 },
		show: false,
		userInfo: null,
		height: app.globalData.systemInfo.autoheight + 70,
	},

	handlePopup() {
		console.log(1);

		this.setData({
			show: !this.data.show
		})
	},
	handleCloseOverlay(e: any) {
		console.log(e);

		this.setData({
			show: !this.data.show
		})

	},
	handleLogin() {
		wx.navigateTo({
			url: "/pages/login/index",
		})
	},

	handleClick({ detail }: any) {
		console.log(detail);

	},
	handleUserInfo() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		let token = getStorageSync("token")
		if (token) {
			wx.navigateTo({
				url: "/subPackagesMine/pages/userInfo/index"
			})
		} else {
			wx.navigateTo({
				url: "/pages/login/index"
			})
		}
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
	handlePageUrl(evt) {
		const { url, type, only, friend } = evt.currentTarget.dataset
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		console.log(url, type)
		if (type == 'page') {
			wx.navigateTo({ url: url + '?date=' + getThisDate('YY-MM') })
		} else {
			let data = {
				from: 'button',
				target: {
					only, friend
				}
			}
			this.onShareAppMessage(data)
		}

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		this.initSystemConfig()
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {
		this.getTabBar().setData({ selected: 4 })
		let token = getStorageSync("token")
		if (!token) {
			this.setData({
				userInfo: null
			})
			return
		}
		let userInfo = getStorageSync("userInfo")

		getUserById({ userId: userInfo.id }).then((res) => {
			setStorageSync('userInfo', res.data);
			this.setData({
				userInfo: res.data
			})
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
	onShareAppMessage(obj) {
		let { from, target } = obj
		console.log(obj)
		let shareObj = {
			title: "简约记账，认准掌账 Mate",
			imageUrl: "/static/icon/icon-Placeholder-image.png",
			path: '/pages/index/index?userId='+ getStorageSync("userInfo").id,
		}
		if (from == 'menu') {//来自
			// shareObj.title = 'menu'
		} else if (from == 'button') {
			// shareObj.title = target.title
			let { id, dataset } = target
			if (id == 's1') {
				// ...
			}

			let { only, friend } = dataset
			if (only == 'friend') {
				// ...
			}
			if (only == 's2') {
				// ...
			}
			if (friend) {
				// ...
			}

		}
		return shareObj
	}

})