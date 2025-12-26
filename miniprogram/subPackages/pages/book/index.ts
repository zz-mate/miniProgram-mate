// subPackages/pages/book/index.ts

const app = getApp()
import { getStorageSync, setStorageSync } from '../../../utils/util';
import { updateBook } from '../../../api/book'
Component({
	// 组件所在页面的生命周期
	pageLifetimes: {
		show: function () {

			this.setData({
				bookList: getStorageSync('bookList') || []
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
		selected: 0,
		bookIndex: 0,
		bookList: [],
	},
	methods: {
		// 添加账本
		handleBookAdd() {
			 wx.vibrateShort({ type: 'heavy' })
			let userInfo = getStorageSync('userInfo')
			if (userInfo.level_exp >= 200) {
				wx.navigateTo({
					url: '/subPackages/pages/book/category/index'
				})
			} else {
				wx.showToast({
					title: "您的积分不足200",
					icon: "none"
				})
			}

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
		async handleMenoSelected({ currentTarget }: any) {
			let that = this
			wx.vibrateShort({ type: 'heavy' })
			let index = currentTarget.dataset.index
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
			that.setData({
				bookIndex: index,
				bookList: newBookList // 更新列表渲染
			});

			wx.navigateBack({ delta: 1 })
			return
			let memoContentsDelete = that.data.bookList || []

			// console.log(memoContents, copyMemoContents);

			if (currentTarget.dataset.selected == this.data.bookIndex) {
				wx.showActionSheet({
					alertText: '功能',
					itemList: ['取消置顶', '删除', '查看', '编辑'],

					success(res) {
						if (res.tapIndex == 0) {
							that.setData({
								bookIndex: null
							})
							setStorageSync('memorandum_index', '')
						} else if (res.tapIndex == 1) {

							memoContentsDelete.splice(index, 1);
							that.setData({
								bookList: memoContentsDelete
							})
							setStorageSync('bookList', memoContentsDelete)
						} else if (res.tapIndex == 2) {
							wx.navigateTo({
								url: `./memorandumPreview/index?value=${currentTarget.dataset.selected}&title=${currentTarget.dataset.title}`,
							})

						} else if (res.tapIndex == 3) {
							wx.navigateTo({
								url: `./memorandumAdd/index?value=${currentTarget.dataset.selected}&title=${currentTarget.dataset.title}`,
							})
						}
						// console.log(res.tapIndex)
					},
					fail(res) {
						// console.log(res.errMsg)
					}
				})
			} else {


				wx.showActionSheet({
					alertText: '功能',
					itemList: ['置顶', '删除', '查看', '编辑'],

					success(res) {
						if (res.tapIndex == 0) {
							let memoContents = that.data.memoContents
							let [copyMemoContents] = memoContents.splice(index, 1)
							memoContents.unshift(copyMemoContents);
							that.setData({
								bookIndex: currentTarget.dataset.selected,
								memoContents: memoContents
							})
							setStorageSync('memorandum_index', currentTarget.dataset.selected)
						} else if (res.tapIndex == 1) {

							memoContentsDelete.splice(index, 1);
							that.setData({
								memoContents: memoContentsDelete
							})
							setStorageSync('memorandum', memoContentsDelete)
						} else if (res.tapIndex == 2) {
							wx.navigateTo({
								url: `./memorandumPreview/index?value=${currentTarget.dataset.selected}`,
							})

						}
						else if (res.tapIndex == 3) {
							wx.navigateTo({
								url: `./memorandumAdd/index?value=${currentTarget.dataset.selected}&title=${currentTarget.dataset.title}`,
							})

						}
						// console.log(res.tapIndex)
					},
					fail(res) {
						// console.log(res.errMsg)
					}
				})
			}



		},

		handleMemoAdd() {
			console.log('新增');
			let userInfo = getStorageSync('userInfo')
			if (userInfo.level_exp >= 200) {
				wx.navigateTo({
					url: './memorandumAdd/index'
				})
			} else {
				wx.showModal({
					title: "您的积分不足200",
					icon: "none"
				})
			}
		},
		// handleDelete(e) {
		//   console.log(e.detail.index);

		//   if (e.detail.index == this.data.bookIndex) {
		//     this.setData({
		//       bookIndex: 0
		//     })
		//   }
		//   let memoContentsDelete = this.data.memoContents
		//   memoContentsDelete.splice(e.detail.index, 1);
		//   this.setData({
		//     memoContents: memoContentsDelete
		//   })

		// },
		// 分享
		onShareAppMessage() {

		}
	},

})
