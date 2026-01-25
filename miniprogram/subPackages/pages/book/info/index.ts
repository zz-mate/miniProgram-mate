// subPackages/pages/book/info/index.ts
import { COLOR } from '../../../../utils/color.js';
import { getBookInfo, shareCreate, removeshareUs } from '../../../../api/book'
import { playBtnAudio } from '../../../../utils/audioUtil'

import { getStorageSync, setStorageSync } from '../../../../utils/util';
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		id:'',
		type:"",
		navBgColor: COLOR.white,
		qrcode: "",
		book_owner_id:"",
		bookInfo: {
			relatedUsers: []
		},
		userInfo:null,
				// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
				isJumpToDetail: false,
				// 新增标记：是否首次进入页面
				isFirstEnter: true,
	},
	editBookName(evt){	
			let item = this.data.bookInfo
			let {book_owner_id} = this.data
			

		let userInfo = getStorageSync("userInfo")
console.log(book_owner_id!==userInfo.id)
console.log(book_owner_id,userInfo.id)
		if(Number(book_owner_id)!==userInfo.id) return		
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		this.setData({
			isJumpToDetail: true
		})
		let params = `bookCategoryId=${item.book_category_id}&icon=${item.icon}&name=${item.name}&userId=${userInfo.id}&id=${item.id}`
		wx.navigateTo({
			url: `/subPackages/pages/book/add/index?${params}`,
			routeType: "wx://upwards" 
		})
	},
	handleExit(){
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);


		const notify = this.selectComponent('#customNotify');
		let that = this
		wx.showModal({
			title: '提示',
			content: `退出「${that.data.bookInfo.name}」群组`,
			confirmText: '确认删除', // 确认按钮（突出警示）
			cancelText: '取消',
			confirmColor: '#FFD608', // 确认按钮用红色，强化风险提示
			success: async function (res) { // 修正：async 应该写在 function 前面，而非后面
				if (res.confirm) {
					// 等待 joinBook 接口调用完成
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					let data = {
						userId:getStorageSync("userInfo").id, bookId: that.data.bookInfo.id
					}
					console.log(data)
					let result = await removeshareUs(data)
					if (result.code == 200) {
						notify.showNotify({
							message: '退出成功',
							type: 'success',
							duration: 2000
						});
						wx.navigateBack({delta:1})
					} else {
						notify.showNotify({
							message: result.msg,
							type: 'error',
							duration: 2000
						});
					}
					// wx.removeStorageSync("shareParams")
				} else {
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					console.log('取消')

				}
			},
			fail: function (err) {
				// 增加失败回调，处理模态框弹出失败的情况
				console.error('模态框弹出失败：', err)

			}
		})
	},
	async deleteUser(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let { name,id } = evt.currentTarget.dataset


		const notify = this.selectComponent('#customNotify');
		let that = this
		wx.showModal({
			title: '提示',
			content: `移除「${name}」用户`,
			confirmText: '确认删除', // 确认按钮（突出警示）
			cancelText: '取消',
			confirmColor: '#FFD608', // 确认按钮用红色，强化风险提示
			success: async function (res) { // 修正：async 应该写在 function 前面，而非后面
				if (res.confirm) {
					// 等待 joinBook 接口调用完成
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					let data = {
						userId:id, bookId: that.data.bookInfo.id
					}
					console.log(data)
					let result = await removeshareUs(data)
					if (result.code == 200) {
						notify.showNotify({
							message: '删除成功',
							type: 'success',
							duration: 2000
						});
						that.getBookInfo(data.bookId)
					} else {
						notify.showNotify({
							message: result.msg,
							type: 'error',
							duration: 2000
						});
					}
					// wx.removeStorageSync("shareParams")
				} else {
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					console.log('取消')

				}
			},
			fail: function (err) {
				// 增加失败回调，处理模态框弹出失败的情况
				console.error('模态框弹出失败：', err)

			}
		})

	},
	async getBookInfo(bookId) {
		let data = {
			"userId": getStorageSync("userInfo").id,
			bookId
		}
		let res = await getBookInfo(data)
		this.setData({
			bookInfo: res.data,
			'bookInfo.relatedUsers':res.data.relatedUsers.length?res.data.relatedUsers:[getStorageSync("userInfo")]
			// 'bookInfo.userList':[
			// 	{ id: 1, avatar: 'http://oss-api.zz-mate.cn/uploads/2026/01/1768616689218-cf1929f0-fdcd-405d-9e93-c668fea7db84.jpg',name:"撒的撒的" },
			// 	{ id: 1, avatar: 'http://oss-api.zz-mate.cn/uploads/2026/01/1768616689218-cf1929f0-fdcd-405d-9e93-c668fea7db84.jpg' ,name:"撒的撒的" },

			// ]
		})
		let datas = {
			inviterUserId: getStorageSync("userInfo").id,
			bookId: this.data.bookInfo.id,
			bookUuid: this.data.bookInfo.uuid
		}
		let ret = await shareCreate(datas)
		setStorageSync("shareUuid", ret.data.shareUuid)
	},
	handlePageUrl(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { type } = evt.currentTarget.dataset
		if (type == 'qrcode') {
			wx.navigateTo({
				url: "/subPackages/pages/book/info/qrcode/index?id=" + this.data.bookInfo.id + '&bookUuid=' + this.data.bookInfo.uuid
			})
		}
	},
	async handleInvite() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);


		this.onShareAppMessage()
	},

	onShareAppMessage() {
		let nickname = getStorageSync("userInfo").nickname
		let userId = getStorageSync("userInfo").id
		let bookname = this.data.bookInfo.name
		let bookId = this.data.bookInfo.id
		let shareUuid = getStorageSync("shareUuid")
		let bookUuid = this.data.bookInfo.uuid
		console.log(nickname)
		let shareObj = {
			title: `${nickname}邀请您加入账本「${bookname}」`,
			imageUrl: this.data.bookInfo.icon,
			path: '/subPackages/pages/book/index?inviterUserId=' + userId + '&bookId=' + bookId + '&type=shareBook&shareUuid=' + shareUuid + '&nickname=' + nickname + '&bookname=' + bookname + '&bookUuid=' + bookUuid,
		}
		return shareObj
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ id,book_owner_id,type }) {
		this.getBookInfo(id)
		this.setData({
			id,
			type,
			book_owner_id,
						// 初始化标记
						isFirstEnter: true,
						isJumpToDetail: false,
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
		this.setData({
			userInfo: getStorageSync("userInfo")
		})


				// 核心判断逻辑：
		// 1. 不是首次进入（排除onLoad后的首次onShow）
		// 2. 是从详情页返回（isJumpToDetail为true）
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
		
			this.getBookInfo(this.data.id)
			// 刷新后重置标记，避免重复刷新
			this.setData({
				isJumpToDetail: false
			})
		}
		// 首次进入后，将标记置为false（后续onShow都是非首次）
		if (this.data.isFirstEnter) {
			this.setData({
				isFirstEnter: false
			})
		}
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
	// onShareAppMessage() {

	// }
})