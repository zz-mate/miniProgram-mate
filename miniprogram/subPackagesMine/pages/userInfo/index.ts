// subPackagesMine/pages/userInfo/index.ts
import { getStorageSync, setStorageSync } from '../../../utils/util';
import { COLOR } from '../../../utils/color.js';
import { playBtnAudio } from '../../../utils/audioUtil'
import { getUserById, updateUser } from '../../../api/user'
import { uploadFile } from '../../../utils/upload'; // 路径根据你的项目结构调整
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight + 70,
		userInfo: null,
		version: ''
	},
	async onChooseAvatar(e) {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		this.chooseAndUploadImage(e.detail.avatarUrl)
	},
	async chooseAndUploadImage(filePath: string) {
	
		const uploadRes = await uploadFile({
			url: '/common/upload/single', // 你的后端上传接口路径
			filePath: filePath, // 图片临时路径
			name: 'file', // 后端接收文件的key（默认是file，可根据后端要求改）
			formData: {
				// 额外的参数（如手机号、用户ID等），按需添加
				// phone: '13800138000',
				// userId: '123456',
			},
			showLoading: true, // 显示上传中loading（默认true，可省略）
		});
		let data = {
			userId: getStorageSync("userInfo").id,
			updateType: 'avatar',
			userInfo: {
				avatar: uploadRes.data.url
			}
		}

		await updateUser(data)
		this.getUserInfo()
	},
	/**
	 * 退出登录
	 */
	logout() {
		wx.vibrateShort({ type: 'heavy' })
		wx.showModal({
			title: "温馨提示",
			content: "确认退出当前账号吗？",
			success(res) {
				if (res.confirm) {
					wx.vibrateShort({ type: 'heavy' })
					wx.clearStorageSync()
					wx.switchTab({
						url: "/pages/index/index"
					})
				}
			}
		})
	},
	getUserInfo() {
		let token = getStorageSync("token")
		if (!token) {
			this.setData({
				userInfo: null
			})
			return
		}
		let userInfo = getStorageSync("userInfo")

		getUserById({
			userId: userInfo.id
		}).then((res) => {
			setStorageSync('userInfo', res.data);
			this.setData({
				userInfo: res.data
			})
		})
	},
	handlePageUrl(evt) {
		const { url, type, value } = evt.currentTarget.dataset
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		console.log(url, type)
		// if (type == 'page') {
		wx.navigateTo({ url: url + '?type=' + type + '&value=' + value, routeType: "wx://upwards" })
		// } else {
		// this.handlePopup()
		// }
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad() {
		const accountInfo = wx.getAccountInfoSync();
		this.setData({
			version: accountInfo.miniProgram.version
		})
		// console.log(accountInfo.miniProgram.version) // 小程序 appId
		// console.log(accountInfo.plugin.appId) // 插件 appId
		// console.log(accountInfo.plugin.version) // 插件版本号， 'a.b.c' 这样的形式
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
		this.getUserInfo()
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