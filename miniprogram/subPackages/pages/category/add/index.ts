// subPackages/pages/category/add/index.ts
import { COLOR } from '../../../../utils/color.js';
import { createCategory,getCategoryIconList } from '../../../../api/category'
import { playBtnAudio } from '../../../../utils/audioUtil'
import { getStorageSync } from '../../../../utils/util.js';
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navBgColor: COLOR.white,
		height: app.globalData.systemInfo.autoheight,
		scrollHeight: 0,
		type: 0,
		name: "",
		isAnimate: false, // 动画开关
		list: [],
		selectedCategory: null, // 存储当前选中的分类信息

	},
	// 获取导航栏高度
	getScrollHeight() {
		const query = wx.createSelectorQuery();
		query.select('.category-container').boundingClientRect();
		query.select('.shortcut').boundingClientRect();

		query.exec((res) => {
			if (res) {

				this.setData({
					scrollHeight: res[0].height + res[1].height
				});
			}
		})

	},
	bindKeyInput: function (e) {
		this.setData({
			name: e.detail.value
		})
	},
	async handleCategorySave() {
		// 播放按钮音效和震动反馈
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' });
	
		// 优化：增加组件实例容错处理
		const notify = this.selectComponent('#customNotify');
	
		// 1. 前置校验：名称非空（使用Notify展示提示）
		const categoryName = this.data.name.trim();
		if (!categoryName) {
			return notify.showNotify({
				message: "请输入分类名称",
				type: 'warning',
				duration: 2000
			});
		}
	
		try {
			// 2. 构造请求参数
			const data = {
				"userId": getStorageSync("userInfo").id,
				"icon": this.data.selectedCategory.childIcon,
				"name": categoryName,
				"bookCategoryId": getStorageSync("bookInfo").book_category_id,
				"type": Number(this.data.type)
			};
	
			// 3. 发起创建分类请求
			const res = await createCategory(data);
	
			// 4. 处理成功响应
			if (res && res.code === 200) {
				notify.showNotify({
					message: res.message || '创建成功',
					type: 'success',
					duration: 1500
				});
				setTimeout(() => {
					wx.navigateBack({ delta: 1 });
				}, 1500);
			} 
			// 5. 处理业务错误
			else if (res && res.message) {
				notify.showNotify({
					message: res.message,
					type: 'error',
					duration: 2500
				});
			}
	
		} catch (error) {
			// 6. 捕获网络错误
			console.error('创建分类失败：', error);
			notify.showNotify({
				message: error.msg || error.message || '请求失败',
				type: 'error',
				duration: 2500
			});
		}
	},
	/**
	 * 选中分类子项（单选逻辑）
	 * @param {Object} e 事件对象
	 */
	selectCategory(e) {
		playBtnAudio('/static/audio/btnaudio.mp3', 1000);
		wx.vibrateShort({ type: 'light' })
		const { parentIndex, childId } = e.currentTarget.dataset;
		const { list } = this.data;
		console.log(parentIndex, childId, 123)
		// 1. 先重置所有子项的选中状态（单选）
		const newList = list.map((parentItem, pIdx) => {
			return {
				...parentItem,
				child: parentItem.child.map(childItem => ({
					...childItem,
					isSelected: false,
				})),
			};
		});
		console.log(newList)
		// 2. 标记当前点击的子项为选中状态
		const targetChild = newList[parentIndex].child.find(item => item.id == childId);
		console.log(targetChild)
		if (targetChild) {
			targetChild.isSelected = true;

			// 3. 存储选中的分类信息
			this.setData({
				list: newList,	
				isAnimate: true,
				selectedCategory: {
					parentName: newList[parentIndex].name,
					childName: targetChild.name,
					childIcon: targetChild.icon,
					childId: targetChild.id,
					parentIndex,
				},
			});
			setTimeout(() => {
				this.setData({ isAnimate: false });
			}, 500);
			// 4. 可选：触发自定义事件/回调，传递选中信息
			console.log("选中分类：", this.data.selectedCategory);
		}
	},
 async	getCategoryIconListFn(){

		let res = await getCategoryIconList({page:1,pageSize:200})


	this.setData({list:res.data.list})
		
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad({ type }) {
		this.setData({ type })
		this.getScrollHeight()
		this.getCategoryIconListFn()
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