// collapse 组件 js
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
    // 增加 key 属性，用于强制刷新组件
    key: {
      type: String,
      value: ''
    },
    totalMoney:{
      type:String,
      value:'0.00'
    },
    title: {
      type: String,
      value: '标题'
    },
    count:{
      type:Number,
      value:0
    },
    expanded: {
      type: Boolean,
      value: false
    },
    accordionGroup: {
      type: String,
      value: ''
    }
  },

  data: {
    isExpanded: false,
    contentHeight: 0,
    contentSelector: '.collapse-content'
  },

  // 监听 key 变化，强制刷新组件
  observers: {
    'key': function(newKey) {
      // 每次 key 变化，重新计算高度
      this.calculateContentHeight();
    },
    'summary': function(newSummary) {
      // 监听 summary 数据变化，重新计算高度
      if (this.data.isExpanded) {
        this.calculateContentHeight();
      }
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        isExpanded: this.properties.expanded
      });
    },
    ready() {
      if (this.data.isExpanded) {
        this.calculateContentHeight();
      }
    }
  },

  methods: {
    onHeaderTap() {
      wx.vibrateShort({ type: 'light' })
      playBtnAudio('/static/audio/btnaudio.mp3', 1000);
      if (this.properties.accordionGroup) {
        this.triggerEvent('accordionChange', {
          group: this.properties.accordionGroup,
          expanded: !this.data.isExpanded
        });
        return;
      }
      this.toggleExpand();
    },

    toggleExpand() {
      const isExpanded = !this.data.isExpanded;
      if (isExpanded) {
        this.calculateContentHeight(() => {
          this.setData({ isExpanded });
        });
      } else {
        this.setData({ isExpanded });
      }
    },

    calculateContentHeight(callback) {
      // 增加延迟，确保 DOM 已更新
      setTimeout(() => {
        const query = this.createSelectorQuery();
        query.select(this.data.contentSelector).boundingClientRect((rect) => {
          if (rect) {
            this.setData({
              contentHeight: rect.height
            }, callback);
          } else {
            // 没有获取到高度时置为0
            this.setData({ contentHeight: 0 }, callback);
          }
        }).exec();
      }, 50);
    },

    onContentLoad() {
      if (this.data.isExpanded) {
        this.calculateContentHeight();
      }
    },

    setExpanded(expanded) {
      if (expanded === this.data.isExpanded) return;
      this.setData({ isExpanded: expanded }, () => {
        if (expanded) {
          this.calculateContentHeight();
        }
      });
    },

    // 暴露给父组件的方法：强制重新计算高度
    reCalculateHeight() {
      this.calculateContentHeight();
    }
  }
});