// subPackagesMine/pages/userInfo/edit/index.ts
import { COLOR } from '../../../../utils/color.js';
import { updateUser } from '../../../../api/user'
import { getStorageSync } from '../../../../utils/util.js';
import {playBtnAudio} from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		type: '',        // 操作类型：nickname/gender
		title: '',       // 页面标题
		nickname: '',    // 昵称值
		gender: 0,       // 性别值（0-未知，1-男，2-女）
	},
	bindKeyInput: function (e) {
		this.setData({
			nickname: e.detail.value
		})
	},
	selectGender(e) {
		const selectGender = e.currentTarget.dataset.gender;
		playBtnAudio('/static/audio/click.mp3', 1000);
		this.setData({ gender: selectGender });
	},
	async handleSave() {
		playBtnAudio('/static/audio/click.mp3', 1000);
		wx.vibrateShort({ type: 'light' })



		let { type, nickname, gender } = this.data
		let data = {}
		if (type == 'nickname') {
			if (nickname == '' || nickname.trim() == "") {
				return wx.showToast({
					title: "请输入名称",
					icon: "none"
				})
			}
			 data = {
				userId: getStorageSync("userInfo").id,
				updateType: type,
				userInfo: {
					nickname
				}
			}

		}else if(type=='gender'){
			 data = {
				userId: getStorageSync("userInfo").id,
				updateType: type,
				userInfo: {
					gender
				}
			}
		}

			let res = await updateUser(data)
			console.log(res)
			if(res.data.code==200){
				wx.navigateBack({
					delta:1
				})
			}
	},





	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ type, value }) {


		// 2. 初始化变量（默认值）
		let title = '';
		let nickname = '';
		let gender = 0;

		// 3. 严格的类型匹配 + 数据格式化
		switch (type) {
			case 'nickname':
				title = '修改昵称';
				nickname = value || ''; // 空值兜底，避免 null/undefined
				break;

			case 'gender':
				title = '修改性别';
				// 格式化 gender 为数字（避免传字符串导致错误）
				gender = Number.isFinite(Number(value)) ? Number(value) : 0;
				break;

			// 4. 未知 type 兜底
			default:
				title = '修改信息';
				wx.showToast({ title: `不支持的类型：${type}`, icon: 'none' });
				break;
		}

		// 5. 批量更新数据（规范写法）
		this.setData({
			type,
			title,
			nickname,
			gender
		});

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