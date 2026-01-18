// components/z-notify/z-notify.ts
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 提示消息
    message: {
      type: String,
      value: ''
    },
    // 提示类型（success/error/warning/info）
    type: {
      type: String,
      value: ''
    },
    // 显示时长（毫秒），0 表示手动关闭
    duration: {
      type: Number,
      value: 2000
    },
    // 定位方式：top 或 bottom
    position: {
      type: String,
      value: 'top',
      observer(newVal) {
        // 确保 position 只能是 top 或 bottom
        if (newVal !== 'top' && newVal !== 'bottom') {
          this.setData({ position: 'top' })
        }
      }
    },
    // 距离顶部的距离（当 position 为 top 时生效）
    top: {
      type: Number,
      value: app.globalData.systemInfo.autoheight || 0
    },
    // 距离底部的距离（当 position 为 bottom 时生效）
    bottom: {
      type: Number,
      value: 80
    },
    // 层级
    zIndex: {
      type: Number,
      value: 9999
    },
    // 是否显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        // 显示时启动自动关闭定时器
        if (newVal && this.data.duration > 0) {
          this.timer && clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.setData({ show: false });
            // 触发关闭事件
            this.triggerEvent('close');
          }, this.data.duration);
        }
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 手动关闭
    close() {
      this.setData({ show: false });
      this.triggerEvent('close');
    },
    // 显示提示
    showNotify(options = {}) {
      // 合并默认配置和传入配置
      const config = {
        message: '',
        type: '',
        duration: this.data.duration,
        position: this.data.position,
        top: this.data.top,
        bottom: this.data.bottom,
        ...options
      };
      this.setData({
        ...config,
        show: true
      });
    }
  },

  /**
   * 组件生命周期：卸载时清除定时器
   */
  detached() {
    this.timer && clearTimeout(this.timer);
  }
});