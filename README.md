
# 微信小程序组件库项目

一个功能丰富的微信小程序项目，包含多种实用组件和页面示例，采用TypeScript开发，支持Skyline渲染引擎。

## 📱 项目特色

- 🎨 **丰富的UI组件** - 包含tabs、popup、日历、表单验证等多种组件
- 📝 **富文本编辑器** - 支持备忘录功能，可编辑和预览富文本内容
- 📊 **数字滚动动画** - 炫酷的数字变化效果
- 🔄 **下拉刷新** - 支持二楼功能的下拉刷新组件
- 🎯 **TypeScript支持** - 完整的类型定义，提升开发体验

## 🏗️ 项目结构

```
miniprogram/
├── pages/                    # 主要页面
│   ├── home/                # 首页
│   ├── demo/                # 组件演示页
│   ├── mine/                # 个人中心
│   └── index/               # 入口页面
├── pagesDemoList/           # 组件示例分包
│   └── pages/
│       ├── tabs/            # 标签页组件
│       ├── popup/           # 弹窗组件
│       ├── numberScrolling/ # 数字滚动
│       ├── calendar/        # 日历组件
│       ├── form/            # 表单验证
│       └── memorandum/      # 备忘录功能
├── components/              # 公共组件
│   ├── navigation-bar/      # 导航栏
│   ├── z-popup/            # 弹窗组件
│   └── richText/           # 富文本编辑器
└── utils/                   # 工具函数
```

## 🚀 快速开始

### 环境要求

- 微信开发者工具 最新版本
- 基础库版本 >= 3.0.0
- 支持Skyline渲染引擎

### 安装运行

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置AppID（可使用测试号）
4. 点击编译运行

## 🎯 主要功能

### 📋 备忘录系统
- 富文本编辑器，支持文字格式化
- 本地存储备忘录数据
- 预览模式查看内容
- 标题和内容编辑

### 🎨 UI组件库
- **Tabs组件** - 可滚动的标签页切换
- **Popup弹窗** - 多种弹出方式和位置
- **日历组件** - 日期选择和展示
- **表单验证** - 完整的表单校验功能
- **加载组件** - 多种加载状态展示

### 🎭 动画效果
- **数字滚动** - 数字递增动画
- **下拉刷新** - 支持二楼的下拉刷新

## 🛠️ 技术栈

- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **样式**: WXSS + SASS
- **渲染**: Skyline渲染引擎
- **存储**: 微信小程序本地存储API

## 📦 组件使用示例

### 富文本编辑器
```xml
<richText 
  id='richText' 
  readOnly='{{false}}'
  placeholder='开始编辑吧...' 
  title='{{title}}'
  bind:onEditorReady='onEditorReady' 
  bind:getEditorContent='getEditorContent'>
</richText>
```

### 导航栏组件
```xml
<navigation-bar 
  title="页面标题" 
  back="{{true}}" 
  homeButton="{{true}}" 
  color="black" 
  background="#FFF">
</navigation-bar>
```

## 🔧 配置说明

### 渲染引擎配置
项目启用了Skyline渲染引擎，提供更好的性能和体验：

```json
{
  "renderer": "skyline",
  "rendererOptions": {
    "skyline": {
      "defaultDisplayBlock": true,
      "disableABTest": true
    }
  }
}
```

### 分包配置
使用分包优化加载性能，组件示例页面独立分包。

## 📱 页面预览

- **首页**: 展示轮播图、搜索框、标签切换等功能
- **组件页**: 各种UI组件的演示和使用示例  
- **个人中心**: 用户信息展示和设置功能
- **备忘录**: 完整的富文本编辑和管理功能

## 🤝 贡献指南

欢迎提交Issue和Pull Request来完善项目！

## 📄 许可证

本项目仅供学习和参考使用。

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！

