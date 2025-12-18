// pagesDemoList/pages/memorandum/index.ts
const app = getApp()
import { getStorageSync, setStorageSync } from '../../../utils/util';
Component({
  // 组件所在页面的生命周期
  pageLifetimes: {
    show: function () {
      console.log(111);
      this.setData({
        memoContents: getStorageSync('memorandum') || [],
        memoContentsIndex: getStorageSync('memorandum_index') || null,
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
    created: () => {
      // console.log(122);
      // console.log(app.globalData);
    },
    attached: function () {
      console.log(222);
      // this.setData({
      //   memoContents:getStorageSync('memorandum') || []
      // })
      // 在组件实例进入页面节点树时执行
    },
    ready: function () {
      console.log(333);

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
    height: app.globalData.systemInfo.autoheight + 50,
    memoTags: [
      { label: '全部', value: '0' },
      { label: '工作', value: '1' },
      { label: '生活', value: '2' },
      { label: '学习', value: '3' },
      { label: '娱乐', value: '4' }],
    selected: 0,
    memoContents: [
      // { title: '1今天的内容完成备大方的奋斗奋斗奋大幅度发的发广告斗奋斗放大放大忘录', content: '今天与产品团队讨论了新功能开发进度，预计下周完成 UI设计评审。需要重点关注用户反馈的性能优化问题。大幅度发斯蒂芬是的防守打法四大分三大发', time: '2024-12-24', tags: ['工作', '会议'], value: 1 },
      // { title: '2今天的内容完成备忘录', content: '今天与产品团队讨论了新功能开发进度，预计下周完成 UI设计评审。需要重点关注用户反馈的性能优化问题。', time: '2024-12-24', tags: ['工作', '会议', '娱乐'], value: 2 },
      // { title: '3今天的内容完成备忘录', content: '今天与产品团队讨论了新功能开发进度，预计下周完成 UI设计评审。需要重点关注用户反馈的性能优化问题。', time: '2024-12-24', tags: [ '会议', ], value: 3 },
      // { title: '4今天的内容完成备忘录', content: '今天与产品团队讨论了新功能开发进度，预计下周完成 UI设计评审。需要重点关注用户反馈的性能优化问题。', time: '2024-12-24', tags: [ '会议', '娱乐'], value: 4 }
    ],
    memoContentsIndex: null

  },
  methods: {
    handleSelected({ currentTarget }: any) {
      this.setData({
        selected: currentTarget.dataset.selected
      })
    },
    handleMenoSelected({ currentTarget }: any) {
      let that = this
      let index = parseInt(currentTarget.dataset.sub, 10);
      let memoContentsDelete = that.data.memoContents || []

      // console.log(memoContents, copyMemoContents);

      if (currentTarget.dataset.selected == this.data.memoContentsIndex) {
        wx.showActionSheet({
          alertText: '功能',
          itemList: ['取消置顶', '删除', '查看', '编辑'],

          success(res) {
            if (res.tapIndex == 0) {
              that.setData({
                memoContentsIndex: null
              })
              setStorageSync('memorandum_index', '')
            } else if (res.tapIndex == 1) {

              memoContentsDelete.splice(index, 1);
              that.setData({
                memoContents: memoContentsDelete
              })
              setStorageSync('memorandum', memoContentsDelete)
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
                memoContentsIndex: currentTarget.dataset.selected,
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
      wx.navigateTo({
        url: './memorandumAdd/index'
      })

    },
    handleDelete(e) {
      console.log(e.detail.index);

      if (e.detail.index == this.data.memoContentsIndex) {
        this.setData({
          memoContentsIndex: null
        })
      }
      let memoContentsDelete = this.data.memoContents
      memoContentsDelete.splice(e.detail.index, 1);
      this.setData({
        memoContents: memoContentsDelete
      })

    },
    // 分享
    onShareAppMessage() {

    }
  },

})
