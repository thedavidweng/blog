---
title: "用 CoverView 简单快速为博客文章创建封面图片"
locale: zh

description: "CoverView是一个由 React 开发，不到 500kb 大小，在GitHub开源的网页项目"
publishedDate: 2022-05-06
tags:
  - Tools
  - LLM-free
draft: false
---

![CoverView 生成示例封面](/posts/coverview-blog-cover-generator/coverview-sample-cover.avif)

## 前言

相信很多人都像我一样，写完文章后准备发表的时候才想起需要一张封面图，只能赶忙临时去做。鼠标指针移到 Photoshop 上突然又感到没这个必要，最后也就去 [Unsplash](https://unsplash.com/) 上随便找张图或者用 [Canva](https://www.canva.com/) 模版简单糊弄一下。今天突然发现一个简直是为我这样的懒狗量身定制的封面图片生成项目：**CoverView**

## 在哪找到

![CoverView GitHub 仓库页](/posts/coverview-blog-cover-generator/coverview-github-repo-showcase.avif)

**CoverView** 是一个由 React 开发，不到 500kb 大小，在 [GitHub](https://github.com/rutikwankhade/CoverView) 开源的网页项目，目前收获三百多个 Stars。

作者提供了托管在 [Vercel](https://coverview.vercel.app/) 的网页。

因为项目比较简单，我就顺手[汉化](https://github.com/thedavidweng/CoverView-CN)了，目前是以 Fork 的形式存在，但是已经给作者提了 [Issue](https://github.com/rutikwankhade/CoverView/issues/18)，未来希望直接合并进主项目作为多语言选项存在。

![汉化版 CoverView 编辑器](/posts/coverview-blog-cover-generator/coverview-cn-localized-editor.avif)

接下来的介绍我会直接使用汉化版的截图。

## 选项

![字体样式选择](/posts/coverview-blog-cover-generator/coverview-font-style-picker.avif)

**CoverView** 目前只提供三种字体样式，未来有改进空间。

![CoverView 颜色与取色面板](/posts/coverview-blog-cover-generator/coverview-color-picker.avif)

颜色方面提供十六进制颜色代码，RGB 数值，取色器和色盘多种交互方式，非常完善。

![主题与标题布局](/posts/coverview-blog-cover-generator/coverview-theme-layout-selector.avif)

![背景图案选择](/posts/coverview-blog-cover-generator/coverview-background-pattern-picker.avif)
样式方面提供了四种主题（标题排列方式）和十九种不同的背景图案。

![图标库与自定义上传](/posts/coverview-blog-cover-generator/coverview-icon-library-panel.avif)

自带图标覆盖了大部分技术文章的需求，底部还有可自主上传的自定义图标选项。

## 总结

**CoverView** 功能非常有限，无法对生成的文章封面做太多修改，甚至不提供拖动标题和修改画布尺寸这样的基础内容，但是胜在足够轻量级，确实很符合其项目说明中轻松快速的描述，未来只要增加更多种类的样式，每次随机一个组合就可以完成简单的博客封面需求。

## 题外话

**CoverView** 的开发者 Rutik Wankhade 另外的作品有 [Tabwave](https://tabwave.vercel.app/) 新标签页，小众软件有[介绍文章](https://www.appinn.com/tabwave-for-chrome-and-firefox/)，也是同样的简单美观小工具风格。

![Tabwave 推广卡片](/posts/coverview-blog-cover-generator/coverview-tabwave-promo-card.avif)