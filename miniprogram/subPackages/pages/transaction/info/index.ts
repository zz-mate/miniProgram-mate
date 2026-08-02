// subPackages/pages/transaction/info/index.ts
import { getBillInfo, deleteBill } from "../../../../api/bill"
import { COLOR } from '../../../../utils/color.js';
import { getStorageSync } from '../../../../utils/util';
import { playBtnAudio } from '../../../../utils/audioUtil'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		id: null,
		bookInfo: null,
		userInfo: null,
		title: "",
		transactionInfo: null,//账单详情
		// 新增标记：是否跳转到详情页（用于判断是否是返回行为）
		isJumpToDetail: false,
		// 新增标记：是否首次进入页面
		isFirstEnter: true,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ id, billType }) {
		let title = ""
		switch (billType) {
			case 'INCOME':
				title = '收入'
				break;
			case 'EXPENSE':
				title = '支出'
				break;
			case 'TRANSFER':
				title = '转账'
				break;
			case 'LOAN':
				title = '借贷'
				break;
		}
		this.setData({
			id, title, bookInfo: getStorageSync("bookInfo"),
			userInfo: getStorageSync("userInfo")
		})
		this.getTransactionInfo(id)
	},


	/**
	 * 获取账单详情
	 */
	async getTransactionInfo(billId) {
		let res = await getBillInfo(billId)
		console.log(res)
		if (res && res.data) {
			this.setData({
				transactionInfo: res.data
			})
		}
	},
	/**编辑 */
	handleUpdate() {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		const { id, type } = this.data.transactionInfo
		const bookInfo = wx.getStorageSync('bookInfo')
		this.setData({
			isJumpToDetail: true
		})
		wx.navigateTo({
			url: "/subPackages/pages/transaction/add/index?bookId=" + bookInfo.id + '&billId=' + id + '&type=' + type,
			routeType: "wx://upwards"
		})
	},
	/**
	 * 打开删除弹窗
	 */
	handleRemove() {
		let that = this
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		wx.showModal({
			title: "温馨提示",
			content: "确认删除该账单吗？",
			success(res) {
				if (res.confirm) {
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					that.handleConfirm()
				} else {
					playBtnAudio('/static/audio/btnaudio.mp3', 1000);
					wx.vibrateShort({ type: 'light' })
				}

			}
		})
	},

	/**
	 * 删除账单
	 */
	async handleConfirm() {
		let res = await deleteBill(this.data.id)
		if (res.code == 200) {
			wx.showToast({
				title: "删除成功",
				icon: "none"
			})
			setTimeout(() => {
				wx.navigateBack({
					delta: 1
				})
			}, 600)

		}
	},
	// 图片预览函数
	previewImage(e) {
		try {
			playBtnAudio('/static/audio/btnaudio.mp3', 1000);
			wx.vibrateShort({ type: 'light' })
			// 获取当前要预览的图片地址
			const currentImgUrl = this.data.transactionInfo.image_list;

			// 校验图片地址是否有效
			if (!currentImgUrl || currentImgUrl.trim() === '') {
				wx.showToast({
					title: '暂无图片可预览',
					icon: 'none'
				});
				return;
			}

			// 调用小程序预览图片接口
			wx.previewImage({
				current: currentImgUrl, // 当前显示的图片链接
				urls: [currentImgUrl],  // 需要预览的图片链接列表（支持多张）
				// 可选：预览时的回调
				success: () => {
					console.log('图片预览成功');
				},
				fail: (err) => {
					console.error('图片预览失败：', err);
					wx.showToast({
						title: '预览失败，请重试',
						icon: 'none'
					});
				}
			});
		} catch (error) {
			console.error('预览图片异常：', error);
			wx.showToast({
				title: '预览出错',
				icon: 'none'
			});
		}
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
		// 核心判断逻辑：
		// 1. 不是首次进入（排除onLoad后的首次onShow）
		// 2. 是从详情页返回（isJumpToDetail为true）
		if (!this.data.isFirstEnter && this.data.isJumpToDetail) {
			console.log("从账单详情页返回，执行刷新")
			// this.handleTransactionList(this.data.type)
			this.getTransactionInfo(this.data.id)
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
	onShareAppMessage() {

	}
})