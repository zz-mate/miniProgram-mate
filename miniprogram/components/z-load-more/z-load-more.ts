// components/z-load-more/z-load-more.ts
Component({
  externalClasses: ['wr-class', 'wr-class--no-more'],

  options: { multipleSlots: true },
  /**
   * 组件的属性列表
   */
  properties: {
    status: {
      type: Number,
      value: 0,
    },
    loadingText: {
      type: String,
      value: '加载中...',
    },
    noMoreText: {
      type: String,
      value: '没有更多了',
    },
    failedText: {
      type: String,
      value: '加载失败',
    },
    color: {
      type: String,
      value: '#BBBBBB',
    },
    failedColor: {
      type: String,
      value: '#FA550F',
    },
    size: {
      type: null,
      value: '40rpx',
    },
    loadingBackgroundColor: {
      type: String,
      value: '#F5F5F5',
    },
    listIsEmpty: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /** 点击处理 */
    tapHandle() {
      // 失败重试
      if (this.data.status === 3) {
        this.triggerEvent('retry');
      }
    },
  }
})