// components/z-popup/z-popup.ts
Component({
  properties: {
    showTitle: { type: String, value: "" },
    show: { type: Boolean, value: false, observer: "watchShow" },
    closeOnClickOverlay: { type: Boolean, value: true }, // 允许点击遮罩关闭
    mode: { type: String, value: 'center' }
  },
  data: { hidden: false, title: '' },
  methods: {
    watchShow(newV) {
      if (newV) {
        this.setData({ hidden: false });
      } else {
        this.setData({ hidden: true });
        setTimeout(() => { this.setData({ hidden: false }); }, 300);
      }
    },
    handlePopup() {
      if (this.data.closeOnClickOverlay) {
        this.triggerEvent('popup', { delta: false, type: this.data.showTitle || '' }, {});
        this.setData({ show: false });
      }
    }
  }
})