// subPackages/pages/book/index.ts

const app = getApp()
import { getStorageSync, setStorageSync } from '../../../utils/util';

import { playBtnAudio } from '../../../utils/audioUtil'
Page({

	/**
 * 页面的初始数据
 */
	data: {
		// 顶部高度与底部高度
		height: app.globalData.systemInfo.autoheight + 70,
		selected: 0,
		bookIndex: 0,
		multiIndex: 0,
		bookList: [],
		bookType: 1,
		userInfo: null,
		startX: '',
		startY: '',
		inviterUserId: '',
		bookId: "",
		type: "",
		shareUuid: ""
	},
	onShow() {
		this.setData({
			bookList: getStorageSync('bookList') || [],
			userInfo: getStorageSync("userInfo"),
		})
		console.log(JSON.stringify(this.data.bookList))
	},

	// 添加账本
	handleBookAdd() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.navigateTo({
			url: '/subPackages/pages/book/category/index'
		})
	},

	/**
	 *
	 * 修改账本
	 */
	handleSelected({ currentTarget }: any) {
		this.setData({
			selected: currentTarget.dataset.selected
		})
	},
	handleMultiSelected({ currentTarget }: any) {
	},

	// handleMenoSelected({ currentTarget }: any) {
	// 	let that = this
	// 	wx.vibrateShort({ type: 'light' })
	// 	playBtnAudio('/static/audio/btnaudio.mp3', 1000);
	// 	let index = currentTarget.dataset.i

	// 	setStorageSync("bookInfo", this.data.bookList[index])
	// 	that.setData({
	// 		bookIndex: index,
	// 	});

	// 	wx.switchTab({
	// 		url: '/pages/index/index'
	// 	})
	// },

	touchS(e) {
		let { bookList } = this.data
		const newBookList = JSON.parse(JSON.stringify(bookList));
		newBookList.forEach((item) => {
			item.isCollapse = true;
		});
		this.setData({
			startX: e.touches[0].clientX,
			startY: e.touches[0].clientY,
			bookList: newBookList
		}, () => {

		});
	},

	touchM(e) {
		if (!e.touches || e.touches.length === 0) return;
		var currentX = e.touches[0].clientX;
		var currentY = e.touches[0].clientY;

		const x = this.data.startX - currentX;
		const y = Math.abs(this.data.startY - currentY);

		let { i } = e.currentTarget.dataset || {};
		const newBookList = JSON.parse(JSON.stringify(this.data.bookList));
		if (newBookList[i]) {
			if (x > 35 && y < 110) {
				newBookList[i].isCollapse = false;
			} else if (x < -35 && y < 110) {
				newBookList[i].isCollapse = true;
			}
		}

		this.setData({
			bookList: newBookList,
		}, () => {

		});
	},

	singleDel(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let { id, name } = evt.currentTarget.dataset
		const notify = this.selectComponent('#customNotify');
		let that = this
		wx.showModal({
			title: '提示',
			content: `删除「${name}」账本，其下所有账单将被删除`,
			confirmText: '确认删除',
			cancelText: '取消',
			confirmColor: '#FFD608',
			success: function (res) {
				if (res.confirm) {
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					console.log('删除账本:', id)
				} else {
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					console.log('取消删除')
				}
			},
			fail: function (err) {
				console.error('模态框弹出失败：', err)
			}
		})
	},

	// 编辑
	handleEditBook(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const { book_owner_id, type } = evt.currentTarget.dataset
		wx.navigateTo({
			url: "/subPackages/pages/book/info/index?id=" + evt.currentTarget.dataset.id + '&book_owner_id=' + book_owner_id + '&type=' + type
		})
	},

	// 分享
	onShareAppMessage() {

	}


})
