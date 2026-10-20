---
title: CSS 容器查询速记
description: 组件级响应式的答案，终于不必再被视口宽度绑架。
pubDate: 2026-02-20
type: note
category: 前端
featured: true
tags: [CSS, 前端]
---

## 为什么需要容器查询

过去响应式只能听**视口**的。但同一个卡片，放在侧边栏和放在主栏，
明明空间不同，却被迫用同一套断点——这不合理。

## 用法

```css
.card-wrapper {
  container-type: inline-size;
}
@container (min-width: 480px) {
  .card { grid-template-columns: 120px 1fr; }
}
```

思路很简单：先声明"这是一个容器"，再用 `@container` 针对容器宽度写规则。
组件从此自带响应式，搬到哪都能用。

## 小结

容器查询让"组件自治"成为现实。新项目里，它已基本取代媒体查询的组件内布局角色。
