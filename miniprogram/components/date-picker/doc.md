##### date-picker | 日期选择组件

**功能：日期选择组件**

兼容Android｜IOS｜Windows｜Mac

**使用**

.json

```json
{
  "usingComponents": {
    "date-picker": "/component/date-picker/date-picker",
  }
}
```

.wxml

```html
<!-- 点击打开日期组件弹窗 -->
<view bindtap="open">{{renderTime || '选择日期'}}</view>
<!-- 日期时间选择弹窗 -->
<date-picker bind:onCancel="onCancel" bind:onConfirm="onConfirm" visible="{{isShowPicker}}" mode="{{mode}}" date="{{date}}" startDate="{{startDate}}" endDate="{{endDate}}" minScale="{{minScale}}"></date-picker>
```

.js

```js
const dateUtils = require('../../../utils/dateutils');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isShowPicker: false,
    mode: 'YMD',
    date: new Date().getTime(),
    startDate: `2023/01/01`,
    endDate: `2025/12/31`,
    minScale: 10, // 时间选择器分钟刻度
    renderTime: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},
  open() {
    const date = this.data.date;
    this.setData({
      isShowPicker: true,
      date: date ? new Date(date).getTime() : new Date().getTime(),
    })
  },
  onCancel(e) {
    this.setData({
      isShowPicker: false
    })
  },
  onConfirm(e) {
    let mode = this.data.mode;
    let date = e.detail.date;
    let renderTime = dateUtils.formatLongTime(date, dateUtils.modeMapToFields[mode]);
    console.log(time);
    this.setData({
      date,
      renderTime,
      isShowPicker: false,
    })
  },
})
```

##### **properties:**

| prop             | 说明           | 类型                                                  |
| ---------------- | -------------- | ----------------------------------------------------- |
| date             | 选中日期时间戳 | String｜Number                                        |
| mode             | 日期格式       | 'YMDhms' \| 'YMDhm' \| 'YMD' \| 'MD' \| 'hm'          |
| visible | 弹窗的显隐     | Boolean                                               |
| minScale         | 分钟显示精度   | Number                                                |
| startDate        | 开始日期限制   | String（仅支持年月日，以/分隔的格式，如：2024/01/01） |
| endDate          | 结束日期限制   | String（仅支持年月日，以/分隔的格式，如：2024/12/31） |

##### **Event:**

| Event    | 说明                       | 参数 | 返回值 |
| -------- | -------------------------- | ---- | ------ |
| onCancel | 点击取消按钮后执行 | 无   | 无     |
| onConfirm | 点击确定按钮后执行 | date(时间戳格式) | 无 |

