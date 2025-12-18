
const { shared, timing } = wx.worklet

const GestureState = {
  POSSIBLE: 0, // 0 此时手势未识别，如 panDown等
  BEGIN: 1, // 1 手势已识别
  ACTIVE: 2, // 2 连续手势活跃状态
  END: 3, // 3 手势终止
  CANCELLED: 4, // 4 手势取消，
}
const { screenHeight, statusBarHeight, safeArea } = wx.getSystemInfoSync()
Component({
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.getTabBar().setData({ selected: 2 })
    },
  },
  data: {
    list: [
      {
        title: 'tabs',
        url: '../../pagesDemoList/pages/tabs/index'
      },
      // {
      //   title: '视差滚动',
      //   url: '../../pagesDemoList/pages/parallaxScrolling/index'
      // },
      {
        title: 'popup',
        url: '../../pagesDemoList/pages/popup/index'
      },
      {
        title: '数字滚动',
        url: '../../pagesDemoList/pages/numberScrolling/index'
      },
      {
        title: '加载',
        url: '../../pagesDemoList/pages/loadMore/index'
      },
      {
        title: '日历',
        url: '../../pagesDemoList/pages/calendar/index'
      },
      {
        title: '表单验证',
        url: '../../pagesDemoList/pages/form/index'
      },
      {
        title: '备忘录',
        url: '../../pagesDemoList/pages/memorandum/index'
      }

    ],
  },

  lifetimes: {
    attached() {
      this.setData({
        height:screenHeight- statusBarHeight- 44 ,//屏幕最大高度 - 顶部状态栏固定高度
      })
    },
    created() {
      this.transY = shared(1000)
      this.scrollTop = shared(0)

      this.toolbarTop = shared(0) //顶部工具栏的高度

      this.startPan = shared(true)
    },
    ready() {
      // ready 生命周期里才能获取到首屏的布局信息
      const query = this.createSelectorQuery()
      query.select('.toolbar').boundingClientRect()
      query.select('.comment-container').boundingClientRect()
      query.exec((res) => {
        // console.log(res);
        // 当前容器高度为 screenHeight-statusBarHeight 
        this.transY.value = this.toolbarTop.value = res[0].height + 20 //顶部工具栏的高度 + 外边距tababr的高度
      })

      // 通过 transY 一个 SharedValue 控制半屏的位置
      this.applyAnimatedStyle('.comment-container', () => {
        'worklet'
        // console.log('---transY', this.transY.value);
        return { transform: `translateY(${this.transY.value}px)` }
      })

    },
  },
  methods: {

    handleDemoList({ currentTarget }: any) {
      let url = currentTarget.dataset.url
      wx.navigateTo({
        url
      })
    },
    // 打开留言按钮
    onTapOpenComment() {
      this.openComment(300)
    },
    // 传递过渡动画时间并赋值给transY的高度
    openComment(duration) {
      'worklet'
      this.transY.value = timing(0, { duration })

    },
    scrollTo(toValue) {
      'worklet'
      this.transY.value = timing(toValue, { duration: 200 })
    },
    // 留言 V 按钮  单独关闭
    onTapCloseComment() {
      this.closeComment()
    },
    // 关闭
    closeComment() {
      'worklet'
      this.transY.value = timing(this.toolbarTop.value, { duration: 200 })
    },
    // shouldPanResponse 和 shouldScrollViewResponse 用于 pan 手势和 scroll-view 滚动手势的协商
    shouldPanResponse() {
      'worklet'
      return this.startPan.value
    },
    shouldScrollViewResponse(pointerEvent) {
      'worklet'
      // console.log('pointerEvent', pointerEvent);
      // transY > 0 说明 pan 手势在移动半屏，此时滚动不应生效
      if (this.transY.value > 0) return false
      // 判断scroll-view内部滚动的距离，判断手势
      const scrollTop = this.scrollTop.value

      const { deltaY } = pointerEvent
      // deltaY > 0 是往上滚动，scrollTop <= 0 是滚动到顶部边界，此时 pan 开始生效，滚动不生效
      const result = scrollTop <= 0 && deltaY > 0
      this.startPan.value = result
      return !result
    },
    // 处理拖动半屏的手势
    handlePan(gestureEvent) {
      'worklet'

      if (gestureEvent.state === GestureState.ACTIVE) {
        const curPosition = this.transY.value
        // console.log(curPosition, gestureEvent.deltaY);

        const destination = Math.max(0, curPosition + gestureEvent.deltaY)
        if (curPosition === destination) return
        if(curPosition>this.toolbarTop.value+100) return
        this.transY.value = destination
        // console.log(this.transY.value);
        
      }

      if (gestureEvent.state === GestureState.END || gestureEvent.state === GestureState.CANCELLED) {

        if (this.transY.value < this.toolbarTop.value) {
          // 在上面的时候
          this.scrollTo(0)
        } else if (this.transY.value > this.toolbarTop.value) {
          // 在中间的时间
          this.scrollTo(this.toolbarTop.value)
        }
      }
    },
    adjustDecelerationVelocity(velocity) {
      'worklet'
      // console.log('scroll-view', velocity);
      const scrollTop = this.scrollTop.value
      return scrollTop <= 0 ? 0 : velocity
    },

    handleScroll(evt) {
      'worklet'
      // 赋值scroll-view距离顶部距离
      this.scrollTop.value = evt.detail.scrollTop
    },
  },
})
