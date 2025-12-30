// pages/login/index.ts

import { login, getUserInfo, jscode2session, saveUser } from '../../api/user';
import { validatePhoneNumber } from '../../utils/util'
import { setStorageSync } from '../../utils/util';
import { setToken } from '../../utils/config'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		checked: true,
		privacy: false,
		show: false,
		phone: '',
		hasUserInfo: false,
		sessionKey: '', // 保存后端返回的sessionKey，用于解密用户信息
		openid: ''      // 保存openid
	},
	bindKeyInput: function (e) {
		this.setData({
			phone: e.detail.value
		})
	},
	handleChange(e: any) {
		console.log(e);
		this.setData({
			checked: !this.data.checked
		})

	},
	bindGetUserInfo(e) {
		console.log(e.detail.userInfo)
	},
	// 点击授权按钮触发（核心：新的授权方式）
	// 小程序前端调用
	async getUserProfile() {
		wx.vibrateShort({ type: 'heavy' })
		let that = this
		const userProfileRes = await wx.getUserProfile({
			desc: '用于完善会员资料'
		});
		// const { nickName, avatarUrl, gender } = userProfileRes.userInfo;


		const { openid } = that.data;
		const { avatarUrl, nickName, gender } = userProfileRes.userInfo
		let data = {
			avatar: avatarUrl,
			nickname: nickName,
			gender, openid
		}
		let res = await saveUser(data)
		if (res.data.code === 0) {
			// 保存Token到本地
			wx.setStorageSync('token', res.data.data.token);
			setStorageSync('userInfo', res.data.data);
			console.log(res.data)
			wx.switchTab({
				url: "/pages/index/index"
			})
		}

	},
	// 把用户信息传给后端保存
	//  async saveUserInfoToServer(userInfo) {
	//     const { openid, sessionKey } = this.data;
	// 		let res = await saveUser({openid,...userInfo})
	//     console.log(res)
	//   },


	handlePopup() {


		this.setData({
			show: !this.data.show,
			privacy:true,
		})
		if (this.data.show) {
			wx.login({
				success: async (loginRes) => {
					const wxRes = await jscode2session({ code: loginRes.code });
					console.log(wxRes)
					this.setData({
						openid: wxRes.data.openid
					})
				}
			});
		}
	},
	handleCloseOverlay(e: any) {
		console.log(e);

		this.setData({
			show: !this.data.show
		})

	},
	handlePrivacy(e: any) {
		console.log(e);
		this.setData({
			privacy: !this.data.privacy
		})

	},
	handlePrivacyOpen() {
		console.log('前往查看');

	},
	/**
	 * 登录 获取用户信息
	 */
async	handleLogin() {
		wx.vibrateShort({ type: 'heavy' })
		if (!this.data.privacy) return
		if (!validatePhoneNumber(this.data.phone)) {
			wx.showToast({
				title: "请输入正确手机号",
				icon: "none"
			})
			return
		}

		// wx.login({
		// 	success: async (loginRes) => {
		// 		const wxRes = await jscode2session({ code: loginRes.code });
		// 		console.log(wxRes)
		// 		this.setData({
		// 			openid: wxRes.data.openid
		// 		})
		// 		let data = { phone: this.data.phone,openid:wxRes.data.openid }
		// 		let res = await	login(data)
		// 		setToken(res.data.token)
		// 		getUserInfo().then((res) => {
		// 			setStorageSync('userInfo', res.data);
		// 			console.log(res.data)
		// 			wx.switchTab({
		// 				url: "/pages/index/index"
		// 			})
		// 		})
		// 	}
		// });

		let data = { phone: this.data.phone,openid:'ohTvM5KNPpBpVNJQ03Xz4WKQY6fA'}
		let res = await	login(data)
		setToken(res.data.token)
		getUserInfo().then((res) => {
			setStorageSync('userInfo', res.data);
			console.log(res.data)
			wx.switchTab({
				url: "/pages/index/index"
			})
		})

		// login({ phone: this.data.phone })
		// 	.then((res) => {
		// 		setToken(res.data.token)

		// 		getUserInfo().then((res) => {
		// 			setStorageSync('userInfo', res.data);
		// 			console.log(res.data)
		// 			wx.switchTab({
		// 				url: "/pages/index/index"
		// 			})
		// 		})
		// 	})
		// 	.catch((error) => {
		// 		wx.showToast({
		// 			title: '加载失败，请稍后重试',
		// 			icon: 'none',
		// 		});
		// 	})
		// 	.finally(() => {

		// 	});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		wx.getSetting({
			success(res) {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称
					wx.getUserInfo({
						success: function (res) {
							console.log(res.userInfo)
						}
					})
				}
			}
		})
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