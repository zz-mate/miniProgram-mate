import { playBtnAudio } from '../../utils/audioUtil'
Component({
  properties: {
		summary:{
			type:Object,
			value:{}
		},
		type:{
			type: String,
      value: ''
		},
    // 折叠面板标题
    title: {
      type: String,
      value: '标题'
    },
    count:{
      type:Number,
      value:0
    },
    totalMoney:{
      type:String,
      value:'0.00'
    },
    // 默认是否展开
    expanded: {
      type: Boolean,
      value: false
    },
    // 手风琴模式下的组名
    accordionGroup: {
      type: String,
      value: ''
    }
  },

  data: {
    // 当前是否展开状态
    isExpanded: false,
    // 内容区域高度
    contentHeight: 0,
    // 内容区域选择器
    contentSelector: '.collapse-content'
  },

  lifetimes: {
    attached() {
      // 初始化展开状态
      this.setData({
        isExpanded: this.properties.expanded
      });
    },

    ready() {
      // 如果默认展开，计算内容高度
      if (this.data.isExpanded) {
        this.calculateContentHeight();
      }
    }
  },

  methods: {
    /**
     * 标题栏点击事件
     */
    onHeaderTap() {
			wx.vibrateShort({ type: 'light' })
			playBtnAudio('/static/audio/click.mp3', 1000);
      // 如果是手风琴模式，通知父组件处理
      if (this.properties.accordionGroup) {
        this.triggerEvent('accordionChange', {
          group: this.properties.accordionGroup,
          expanded: !this.data.isExpanded
        });
        return;
      }

      // 切换展开/折叠状态
      this.toggleExpand();
    },

    /**
     * 切换展开/折叠状态
     */
    toggleExpand() {
      const isExpanded = !this.data.isExpanded;
      
      if (isExpanded) {
        // 展开时计算内容高度
        this.calculateContentHeight(() => {
          this.setData({
            isExpanded
          });
        });
      } else {
        // 直接折叠
        this.setData({
          isExpanded
        });
      }
    },

    /**
     * 计算内容区域高度
     */
    calculateContentHeight(callback) {
      const query = this.createSelectorQuery();
      query.select(this.data.contentSelector).boundingClientRect((rect) => {
        if (rect) {
          this.setData({
            contentHeight: rect.height
          }, callback);
        }
      }).exec();
    },

    /**
     * 内容区域加载完成事件
     */
    onContentLoad() {
      // 如果当前是展开状态，重新计算高度
      if (this.data.isExpanded) {
        this.calculateContentHeight();
      }
    },

    /**
     * 外部控制展开/折叠
     */
    setExpanded(expanded) {
      if (expanded === this.data.isExpanded) return;
      
      this.setData({
        isExpanded: expanded
      }, () => {
        if (expanded) {
          this.calculateContentHeight();
        }
      });
    }
  }
});
