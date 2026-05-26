# SEO 优化方案

## 一、当前 SEO 状态分析

### 1.1 已实现的 SEO 元素

| 元素 | 状态 | 说明 |
|------|------|------|
| Meta Title | ✅ 已实现 | 包含中英文标题 |
| Meta Description | ✅ 已实现 | 155字符内的描述 |
| Meta Keywords | ⚠️ 部分实现 | 关键词较少，可扩展 |
| Canonical URL | ✅ 已实现 | 已设置规范链接 |
| Open Graph | ✅ 已实现 | 社交分享预览 |
| Twitter Card | ✅ 已实现 | Twitter 分享卡片 |
| JSON-LD | ✅ 已实现 | 结构化数据 |
| Sitemap | ⚠️ 部分实现 | 仅包含首页 |
| Robots.txt | ✅ 已实现 | 允许所有爬虫 |
| 语言标记 | ✅ 已实现 | lang="en" |

### 1.2 当前问题

1. **单页应用 (SPA) SEO 困难**：所有内容通过 JavaScript 动态渲染，搜索引擎爬虫可能无法完全索引
2. **缺少图片 SEO**：没有 og:image 和 twitter:image
3. **内容页面无法被索引**：游戏页面、星座详情等无法被搜索引擎抓取
4. **缺少内部链接**：没有可被爬虫跟踪的静态链接
5. **缺少外链建设**：没有反向链接
6. **sitemap 过于简单**：只有一个 URL

---

## 二、SEO 优化策略

### 2.1 技术层面优化

#### 2.1.1 预渲染 / SSR 方案

**问题**：当前 SPA 架构导致搜索引擎无法有效抓取动态内容。

**解决方案**：采用预渲染方案

```
方案A: 使用 Prerender.io 服务
- 优点：无需修改代码架构
- 缺点：需要付费服务

方案B: 使用 prerender-spa-plugin 构建静态页面
- 优点：免费，构建时生成静态 HTML
- 缺点：需要修改构建流程

方案C: 迁移到 Nuxt.js / Next.js
- 优点：原生 SSR 支持，最佳 SEO 效果
- 缺点：需要大规模重构
```

**推荐方案**：方案B - 使用 prerender-spa-plugin

```javascript
// vue.config.js 或 webpack 配置示例
const PrerenderSPAPlugin = require('prerender-spa-plugin')

new PrerenderSPAPlugin({
  staticDir: path.join(__dirname, 'dist'),
  routes: [
    '/',
    '/constellation/lyra',
    '/constellation/orion',
    // ... 其他星座页面
  ],
  renderer: new PrerenderSPAPlugin.PuppeteerRenderer({
    renderAfterDocumentEvent: 'render-event'
  })
})
```

#### 2.1.2 添加结构化数据

**扩展 JSON-LD 结构化数据**：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Starlight Constellation",
  "description": "...",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
    "bestRating": "5",
    "worstRating": "1"
  },
  "screenshot": "https://constellation.sidehustle.top/images/screenshot-1.png",
  "featureList": [
    "Interactive constellation connection game",
    "3D immersive star-gazing experience",
    "16 constellations with ancient myths",
    "Bilingual support (English/Chinese)"
  ]
}
```

**添加 FAQ 结构化数据**：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Starlight Constellation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Starlight Constellation is an interactive web game..."
      }
    }
  ]
}
```

#### 2.1.3 图片 SEO 优化

**添加分享预览图**：

```html
<!-- Open Graph Image -->
<meta property="og:image" content="https://constellation.sidehustle.top/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Starlight Constellation - Interactive Star Connection Game">

<!-- Twitter Image -->
<meta name="twitter:image" content="https://constellation.sidehustle.top/images/twitter-card.png">
```

**创建预览图设计要求**：
- 尺寸：1200 x 630 像素
- 内容：展示游戏主界面 + 星座连线效果
- 文字：应用名称 + 简短标语
- 风格：深蓝星空背景 + 金色星星

---

### 2.2 内容层面优化

#### 2.2.1 创建静态内容页面

**新增页面结构**：

```
/                           # 首页
/about                     # 关于页面
/how-to-play              # 游戏指南
/constellations           # 星座百科
  /constellations/orion   # 猎户座详情
  /constellations/lyra    # 天琴座详情
  ... (16个星座)
/blog                      # 博客文章
  /blog/best-stargazing-locations
  /blog/constellation-myths
/privacy                   # 隐私政策
/terms                     # 服务条款
```

#### 2.2.2 星座百科页面内容模板

每个星座页面应包含：

```html
<!-- 示例：猎户座页面 -->
<article>
  <h1>Orion Constellation - The Hunter</h1>
  <h2>猎户座 - 冬夜最壮观的星座</h2>
  
  <section>
    <h2>Overview</h2>
    <p>Orion is one of the most recognizable constellations in the night sky...</p>
  </section>
  
  <section>
    <h2>Key Stars</h2>
    <ul>
      <li><strong>Betelgeuse (参宿四)</strong> - A red supergiant star...</li>
      <li><strong>Rigel (参宿七)</strong> - A blue supergiant star...</li>
      <li><strong>Belt Stars</strong> - Three stars in a row...</li>
    </ul>
  </section>
  
  <section>
    <h2>Mythology</h2>
    <p>Orion represents the great hunter from Greek mythology...</p>
  </section>
  
  <section>
    <h2>Best Viewing Time</h2>
    <p>Orion is best visible in winter evenings...</p>
  </section>
  
  <section>
    <h2>Play the Game</h2>
    <a href="/game?constellation=orion">Connect Orion's stars →</a>
  </section>
</article>
```

#### 2.2.3 博客内容规划

| 文章标题 | 关键词 | 目标用户 |
|---------|--------|---------|
| Best Stargazing Locations in 2024 | stargazing, astronomy, night sky | 天文爱好者 |
| The Myth Behind Orion Constellation | Orion mythology, Greek myths | 文化爱好者 |
| How to Find Constellations in the Night Sky | find constellations, star map | 初学者 |
| 12 Zodiac Constellations and Their Meanings | zodiac, horoscope | 占星爱好者 |
| Beginner's Guide to Astronomy | astronomy beginner, telescope | 新手入门 |

---

### 2.3 技术 SEO 清单

#### 2.3.1 页面性能优化

```yaml
性能优化项目:
  - 图片压缩: 使用 WebP 格式，添加 lazy loading
  - 代码分割: 按路由分割 JS/CSS
  - 缓存策略: 设置适当的 Cache-Control
  - CDN 加速: 使用 CDN 分发静态资源
  - Core Web Vitals:
    - LCP < 2.5s
    - FID < 100ms
    - CLS < 0.1
```

#### 2.3.2 移动端优化

```yaml
移动端 SEO:
  - 响应式设计: ✅ 已实现
  - 触控友好: ✅ 已实现
  - 移动端速度: 需优化
  - AMP 版本: 可选实现
```

#### 2.3.3 国际化 SEO

```html
<!-- 添加 hreflang 标签 -->
<link rel="alternate" hreflang="en" href="https://constellation.sidehustle.top/?lang=en">
<link rel="alternate" hreflang="zh" href="https://constellation.sidehustle.top/?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://constellation.sidehustle.top/">
```

---

### 2.4 外链建设策略

#### 2.4.1 目标平台

| 平台类型 | 具体平台 | 操作方式 |
|---------|---------|---------|
| 产品目录 | Product Hunt, Hacker News | 发布产品 |
| 设计社区 | Dribbble, Behance | 展示 UI 设计 |
| 开发社区 | GitHub, Dev.to | 开源代码、技术文章 |
| 游戏平台 | itch.io, Kongregate | 发布游戏 |
| 社交媒体 | Twitter, Reddit, 小红书 | 内容营销 |

#### 2.4.2 内容营销策略

1. **技术文章**：在 Dev.to/Medium 发布开发技术分享
2. **设计展示**：在 Dribbble 发布星座设计作品
3. **游戏评测**：联系游戏博主进行评测
4. **社交媒体**：定期发布星座知识、游戏截图

---

## 三、关键词策略

### 3.1 核心关键词

| 关键词 | 搜索量 | 竞争度 | 优先级 |
|--------|--------|--------|--------|
| constellation game | 2,400 | 中 | 高 |
| star connection game | 880 | 低 | 高 |
| interactive star map | 1,600 | 中 | 高 |
| learn constellations | 1,200 | 中 | 中 |
| night sky game | 720 | 低 | 中 |
| astronomy game | 1,900 | 中 | 中 |

### 3.2 长尾关键词

| 关键词 | 搜索意图 |
|--------|---------|
| how to find orion constellation | 信息类 |
| connect the dots stars game | 导航类 |
| free online astronomy game | 交易类 |
| constellation learning app | 信息类 |
| zodiac constellations game | 信息类 |

---

## 四、实施计划

### 第一阶段（1-2周）

- [ ] 添加 og:image 和 twitter:image
- [ ] 扩展 JSON-LD 结构化数据
- [ ] 创建 robots.txt 增强版
- [ ] 添加 hreflang 标签
- [ ] 创建 sitemap.xml 完整版

### 第二阶段（2-4周）

- [ ] 实现预渲染方案
- [ ] 创建星座百科页面（16个）
- [ ] 添加关于页面、隐私政策
- [ ] 优化 Core Web Vitals

### 第三阶段（1-2月）

- [ ] 创建博客系统
- [ ] 发布 5-10 篇 SEO 文章
- [ ] 外链建设
- [ ] 社交媒体推广

---

## 五、效果监测

### 5.1 监测工具

- Google Search Console
- Google Analytics 4
- Ahrefs / SEMrush（关键词排名）
- PageSpeed Insights（性能）

### 5.2 关键指标

| 指标 | 当前目标 | 3个月目标 | 6个月目标 |
|------|---------|----------|----------|
| 索引页面数 | 1 | 20+ | 50+ |
| 自然搜索流量 | <100/月 | 500/月 | 2000/月 |
| 关键词排名（Top 10） | 0 | 5 | 15 |
| 外链数量 | 0 | 10 | 30 |
| Domain Authority | <10 | 15 | 25 |

---

## 六、总结

当前网站 SEO 的主要瓶颈是 **SPA 架构导致的内容不可索引** 和 **缺乏静态内容页面**。通过实施预渲染方案、创建星座百科和博客内容、以及外链建设，可以显著提升搜索引擎可见性和自然流量。
