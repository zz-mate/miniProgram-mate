// components/z-cell/z-cell.ts
Component({
  options: {
    // multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    // styleIsolation: 'shared'
    styleIsolation: 'apply-shared',
    addGlobalClass: true,
  
  },
  
  // externalClasses: ['cell-lists'],
  /**
   * 组件的属性列表
   */
  properties: {
    cellList:{
      type:Array,
      value:[]
    },
    type:{
      type:Boolean,
      value:false
    },
    cellborder:{
      type:Boolean,
      value:true
    },
    leftimg:{
      type:String,
      value:''
    },
    center:{
      type:String,
      value:''
    },
    note:{
      type:String,
      value:''
    },
    rightimg:{
      type:Boolean,
      value:true
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
    handleTap(e: any) {
      console.log(e);
      this.triggerEvent('handleClick', { data:e.currentTarget.dataset}, {})

    }
  }
})