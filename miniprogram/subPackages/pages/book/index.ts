// subPackages/pages/book/index.ts

const app = getApp()
import { getStorageSync, removeStorageSync, setStorageSync } from '../../../utils/util';
import { updateBook, joinBook, getBookList, remove, removeMutiBook, removeshareUs } from '../../../api/book'

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
		this.getBookList()
	},
	async getBookList() {
		let res = await getBookList({ userId: getStorageSync("userInfo").id })
		setStorageSync("bookList", res.data.bookList)
		this.setData({
			bookList: res.data.bookList,
		})
	},
	// 新增：页面加载时接收分享参数（核心）
	onLoad: function (options) {
		// 捕获分享链接中的 userId 和 bookId
		const { inviterUserId, bookId, type, shareUuid, nickname, bookname } = options || {};
		if (inviterUserId && bookId && type) {
			console.log('接收的分享参数：', { inviterUserId, bookId, type, shareUuid, nickname, bookname });
			// 1. 存入组件 data，供后续使用
			this.setData({
				inviterUserId, bookId, type, shareUuid, nickname, bookname
			});
			// 2. 可选：存入缓存，防止数据丢失
			setStorageSync('shareParams', { inviterUserId, bookId, type, shareUuid, nickname, bookname });
			// 3. 可选：执行业务逻辑（比如加入该账本）
			if (type == 'shareBook') {
				const notify = this.selectComponent('#customNotify');
				let that = this
				wx.showModal({
					title: '提示',
					content: `${nickname}邀请你加入「${bookname}」一起记账`,
					success: async function (res) { // 修正：async 应该写在 function 前面，而非后面
						if (res.confirm) {
							// 等待 joinBook 接口调用完成
							let result = await joinBook({ shareUuid, userId: Number(getStorageSync("userInfo").id) })
							if (result.code == 200) {
								notify.showNotify({
									message: '加入成功',
									type: 'success',
									duration: 2000
								});

								let res = await getBookList({ userId: getStorageSync("userInfo").id })
								setStorageSync("bookList", res.data.bookList)
								that.setData({
									bookList: res.data.singleBookList
								})
							} else {
								notify.showNotify({
									message: result.msg,
									type: 'error',
									duration: 2000
								});
							}
							// wx.removeStorageSync("shareParams")
						} else {
							console.log('取消')
							wx.removeStorageSync("shareParams")
						}
					},
					fail: function (err) {
						// 增加失败回调，处理模态框弹出失败的情况
						console.error('模态框弹出失败：', err)
						wx.removeStorageSync("shareParams")
					}
				})
			}

		}
	},


	// 添加账本
	handleBookAdd() {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		// let userInfo = getStorageSync('userInfo')
		// if (userInfo.level_exp >= 200) {
		wx.navigateTo({
			url: '/subPackages/pages/book/category/index'
		})
		// } else {
		// 	wx.showToast({
		// 		title: "您的积分不足200",
		// 		icon: "none"
		// 	})
		// }

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
		// let that = this
		// wx.vibrateShort({ type: 'light' })
		// playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		// let index = currentTarget.dataset.i
		// console.log(bookInfo)
		// setStorageSync("bookInfo", bookInfo)
		// setStorageSync("bookType", 2)
		// this.setData({
		// 	multiIndex: index
		// })
		// setStorageSync("multiIndex", index)
		// wx.navigateBack({ delta: 1 })
	},
	async handleMenoSelected({ currentTarget }: any) {
		let that = this
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let index = currentTarget.dataset.i
		let data = {
			bookId: this.data.bookList[index].id,
			userId: getStorageSync("userInfo").id,
			is_default: 1
		}
		await updateBook(data)
		const newBookList = that.data.bookList.map((item, idx) => {
			return {
				...item,
				is_default: idx === index ? 1 : 0 // 选中的为1，其他为0
			};
		});

setStorageSync("bookInfo",this.data.bookList[index])
		that.setData({
			bookIndex: index,
			bookList: newBookList // 更新列表渲染
		});

		wx.switchTab({
			url:'/pages/index/index'
		})
	},
	touchS(e) {
		let { bookList } = this.data
		const newTransactionList = JSON.parse(JSON.stringify(bookList));
		newTransactionList.forEach((item) => {
			item.status = true;
		});
		this.setData({
			startX: e.touches[0].clientX,  // 触摸起始X坐标
			startY: e.touches[0].clientY,  // 触摸起始Y坐标
			bookList: newTransactionList  // 更新后的列表数据
		}, () => {

		});
	},
	touchM(e) {
		// 1. 安全获取当前触摸坐标，做容错处理
		if (!e.touches || e.touches.length === 0) return;
		var currentX = e.touches[0].clientX;
		var currentY = e.touches[0].clientY;

		// 2. 计算滑动距离（横向/纵向）
		const x = this.data.startX - currentX; // 横向移动距离（x>0 向左滑，x<0 向右滑）
		const y = Math.abs(this.data.startY - currentY); // 纵向移动距离

		// 3. 安全获取 dataset 中的索引（适配 transactionList 的 index/i）
		let { i } = e.currentTarget.dataset || {};
		const newTransactionList = JSON.parse(JSON.stringify(this.data.bookList));
		if (newTransactionList[i]) {
			if (x > 35 && y < 110) {
				// 向左滑：显示删除 → status 设为 false
				newTransactionList[i].status = false;
			} else if (x < -35 && y < 110) {
				// 向右滑：隐藏删除 → status 设为 true
				newTransactionList[i].status = true;
			}
		}

		// 7. 响应式更新数据（核心：用新数据替换原数据）
		this.setData({
			bookList: newTransactionList,
		}, () => {
			// 可选：验证更新结果

		});
	},


	// MtouchS(e) {
	// 	let { multiBookList } = this.data
	// 	const newTransactionList = JSON.parse(JSON.stringify(multiBookList));
	// 	newTransactionList.forEach((item) => {
	// 		item.status = true;
	// 	});
	// 	this.setData({
	// 		startX: e.touches[0].clientX,  // 触摸起始X坐标
	// 		startY: e.touches[0].clientY,  // 触摸起始Y坐标
	// 		multiBookList: newTransactionList  // 更新后的列表数据
	// 	}, () => {

	// 	});
	// },
	// MtouchM(e) {
	// 	// 1. 安全获取当前触摸坐标，做容错处理
	// 	if (!e.touches || e.touches.length === 0) return;
	// 	var currentX = e.touches[0].clientX;
	// 	var currentY = e.touches[0].clientY;

	// 	// 2. 计算滑动距离（横向/纵向）
	// 	const x = this.data.startX - currentX; // 横向移动距离（x>0 向左滑，x<0 向右滑）
	// 	const y = Math.abs(this.data.startY - currentY); // 纵向移动距离

	// 	// 3. 安全获取 dataset 中的索引（适配 transactionList 的 index/i）
	// 	let { i } = e.currentTarget.dataset || {};
	// 	const newTransactionList = JSON.parse(JSON.stringify(this.data.multiBookList));
	// 	if (newTransactionList[i]) {
	// 		if (x > 35 && y < 110) {
	// 			// 向左滑：显示删除 → status 设为 false
	// 			newTransactionList[i].status = false;
	// 		} else if (x < -35 && y < 110) {
	// 			// 向右滑：隐藏删除 → status 设为 true
	// 			newTransactionList[i].status = true;
	// 		}
	// 	}

	// 	// 7. 响应式更新数据（核心：用新数据替换原数据）
	// 	this.setData({
	// 		multiBookList: newTransactionList,
	// 	}, () => {
	// 		// 可选：验证更新结果

	// 	});
	// },
	async singleDel(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		let { id, name } = evt.currentTarget.dataset
		console.log(evt)
		const notify = this.selectComponent('#customNotify'); let that = this
		wx.showModal({
			title: '提示',
			content: `删除「${name}」账本，其下所有账单将被删除`,
			confirmText: '确认删除', // 确认按钮（突出警示）
			cancelText: '取消',
			confirmColor: '#FFD608', // 确认按钮用红色，强化风险提示
			success: async function (res) { // 修正：async 应该写在 function 前面，而非后面

				if (res.confirm) {
					// 等待 joinBook 接口调用完成
					wx.vibrateShort({ type: 'light' })
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					let data = {
						bookId: id,
						userId: getStorageSync("userInfo").id,

					}
					console.log(data)
					let result = await remove(data)
					if (result.code == 200) {
						notify.showNotify({
							message: '删除成功',
							type: 'success',
							duration: 2000
						});
						let ret = await getBookList({ userId: getStorageSync("userInfo").id })
						setStorageSync("bookList", ret.data.bookList)
				
						that.setData({
							bookList: ret.data.bookList,
						})
						// wx.navigateBack({ delta: 1 })

					} else {
						notify.showNotify({
							message: result.message,
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
	// MutilDel(evt) {
	// 	// removeMutiBook
	// 	wx.vibrateShort({ type: 'light' })
	// 	playBtnAudio('/static/audio/btnaudio.mp3', 1000);
	// 	let { id, name, book_owner_id } = evt.currentTarget.dataset
	// 	let exitType = book_owner_id == this.data.userInfo.id ? 1 : 2
	// 	let exitText=exitType==1?'解散':'退出'
	// 	console.log(evt)
	// 	const notify = this.selectComponent('#customNotify');
	// 	let that = this
	// 	wx.showModal({
	// 		title: '提示',
	// 		content: `确定要${exitText}「${name}」账本吗，其下所有账单将被删除`,
	// 		confirmText: `确认${exitText}`, // 确认按钮（突出警示）
	// 		cancelText: '取消',
	// 		confirmColor: '#FFD608', // 确认按钮用红色，强化风险提示
	// 		success: async function (res) { // 修正：async 应该写在 function 前面，而非后面
	// 			if (res.confirm) {
	// 				// 等待 joinBook 接口调用完成
	// 				wx.vibrateShort({ type: 'light' })
	// 				playBtnAudio('/static/audio/btnaudio.mp3', 1000);


	// 				if (exitType == 1) {
	// 					let data = {
	// 						id,
	// 						userId: getStorageSync("userInfo").id,

	// 					}
	// 					let result = await removeMutiBook(data)
	// 					if (result.code == 200) {
	// 						notify.showNotify({
	// 							message: '已解散',
	// 							type: 'success',
	// 							duration: 2000
	// 						});
	// 						let ret = await getBookList({ userId: getStorageSync("userInfo").id })
	// 						setStorageSync("bookList", ret.data.singleBookList)
	// 						setStorageSync("multiBookList", ret.data.multiBookList)
	// 						that.setData({
	// 							bookList: ret.data.singleBookList,
	// 							multiBookList: ret.data.multiBookList
	// 						})
	// 					} else {
	// 						notify.showNotify({
	// 							message: result.msg,
	// 							type: 'error',
	// 							duration: 2000
	// 						});
	// 					}


	// 				}else {
	// 					let data = {
	// 						userId: getStorageSync("userInfo").id, bookId: id
	// 					}
	// 					console.log(data)
	// 					let result = await removeshareUs(data)
	// 					if (result.code == 200) {
	// 						notify.showNotify({
	// 							message: '退出成功',
	// 							type: 'success',
	// 							duration: 2000
	// 						});
	// 						let ret = await getBookList({ userId: getStorageSync("userInfo").id })
	// 						setStorageSync("bookList", ret.data.singleBookList)
	// 						setStorageSync("multiBookList", ret.data.multiBookList)
	// 						that.setData({
	// 							bookList: ret.data.singleBookList,
	// 							multiBookList: ret.data.multiBookList
	// 						})
	// 					} else {
	// 						notify.showNotify({
	// 							message: result.msg,
	// 							type: 'error',
	// 							duration: 2000
	// 						});
	// 					}
	// 				} 
	// 				// wx.removeStorageSync("shareParams")
	// 			} else {
	// 				wx.vibrateShort({ type: 'light' })
	// 				playBtnAudio('/static/audio/btnaudio.mp3', 1000);
	// 				console.log('取消')

	// 			}
	// 		},
	// 		fail: function (err) {
	// 			// 增加失败回调，处理模态框弹出失败的情况
	// 			console.error('模态框弹出失败：', err)

	// 		}
	// 	})
	// },
	// 编辑
	handleEditBook(evt) {
		wx.vibrateShort({ type: 'light' })
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		const {book_owner_id,type} = evt.currentTarget.dataset
		wx.navigateTo({
			url: "/subPackages/pages/book/info/index?id=" + evt.currentTarget.dataset.id+'&book_owner_id='+book_owner_id+'&type='+type
		})
	},
	// 分享
	onShareAppMessage() {

	}


})
