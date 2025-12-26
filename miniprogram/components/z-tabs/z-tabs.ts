// components/z-tabs/z-tabs.ts
import SystemConfig from '../../utils/capsule';
Component({
  options: {
    // multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    // styleIsolation: 'shared'
    styleIsolation: 'isolated',
    // addGlobalClass: true,
  
  },
  lifetimes: {
    created() {
      this.initSystemConfig();
    },
    attached: function() {
      // 在组件实例进入页面节点树时执行
      const query = this.createSelectorQuery();
      query.select('.tabsCntainer').boundingClientRect((rect) => {
        // 直接在这里进行另一个查询，不需要再次调用 .exec()（因为它是在这个回调中）
        this.createSelectorQuery().select('.tabsItemActive').boundingClientRect((res) => {
          this.setData({
            lineLeft: res.left - rect.left,
            lineWidth: res.width,
          });
        }).exec(); // 这个 .exec() 是必需的，因为它启动了内层查询
      
      }).exec(); // 这个 .exec() 也是必需的，因为它启动了外层查询

    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    active: {
      type: Number,
      value: 0,
      observer:'watchActive'
    },
    size: {
      type: String,
      value: 'normal'  //small
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // lineLeft: 5,
    // lineWidth:60
    capsuleHeight: 0,
    navBarHeight: 0,
    statusBarHeight: 0,
    deviceType: '',
    safeAreaInset: { top: 0, bottom: 0 },
  },

  /**
   * 组件的方法列表
   */

  methods: {  

    initSystemConfig() {
      const capsuleConfig = SystemConfig.getCapsuleConfig();
      const safeAreaInset = SystemConfig.getSafeAreaInset();

      this.setData({
        capsuleHeight: capsuleConfig.capsuleHeight,
        navBarHeight: capsuleConfig.navBarHeight,
        statusBarHeight: capsuleConfig.statusBarHeight,
        deviceType: capsuleConfig.isIOS ? 'iOS' : capsuleConfig.isAndroid ? 'Android' : 'Unknown',
        safeAreaInset
      });
    },
    watchActive(newVal, oldVal){
    // console.log('active 属性值变化了！');
    // console.log('新值:', newVal);
    // console.log('旧值:', oldVal);
  
      const query = this.createSelectorQuery();
      query.select('.tabsCntainer').boundingClientRect((rect) => {
        // 直接在这里进行另一个查询，不需要再次调用 .exec()（因为它是在这个回调中）
        this.createSelectorQuery().select('.tabsItemActive').boundingClientRect((res) => {
          this.setData({
            lineLeft: res.left - rect.left,
            lineWidth: res.width,
          });
        }).exec(); // 这个 .exec() 是必需的，因为它启动了内层查询
      
      }).exec(); // 这个 .exec() 也是必需的，因为它启动了外层查询
  
  },
    handleItemActive({ currentTarget }: any) {
// console.log(currentTarget);

      // this.setData({
      //   //此处应修改为发生变动后重新赋值
      //   active: currentTarget.dataset.sub
      // }, () => {
      //   const query = this.createSelectorQuery();
      //   query.select('.tabsCntainer').boundingClientRect((rect) => {
      //     // 直接在这里进行另一个查询，不需要再次调用 .exec()（因为它是在这个回调中）
      //     this.createSelectorQuery().select('.tabsItemActive').boundingClientRect((res) => {
      //       this.setData({
      //         lineLeft: res.left - rect.left,
      //         lineWidth: res.width,
      //       });
      //     }).exec(); // 这个 .exec() 是必需的，因为它启动了内层查询
        
      //   }).exec(); // 这个 .exec() 也是必需的，因为它启动了外层查询
      // })
      this.triggerEvent('change', { delta: currentTarget.dataset }, {})
    }
    ,
  }
})