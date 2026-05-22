# 星座连线游戏 — 技术方案说明

## 1. 技术选型

### 1.1 整体架构

| 层面 | 经典模式 | 沉浸模式 |
|------|----------|----------|
| 渲染引擎 | **HTML5 Canvas** | **Three.js (WebGL)** |
| UI框架 | **原生 HTML/CSS/JS** | **原生 HTML/CSS/JS** |
| 样式方案 | **CSS3 + CSS变量** | **CSS3 + CSS变量** |
| 状态管理 | **自定义 Store**（共享） | **自定义 Store**（共享） |
| 数据持久化 | **localStorage**（共享） | **localStorage**（共享） |
| 构建工具 | **无** | **无**（Three.js CDN） |

### 1.2 双模式技术选型理由

**经典模式**保持零依赖的 Canvas 方案：
- 极致轻量，首屏秒开
- 2D 渲染性能优异
- 无需加载 3D 库

**沉浸模式**采用 Three.js：
- 成熟的天球/粒子系统方案
- 内置相机控制（可定制）
- WebGL 渲染数千颗星星毫无压力
- CDN 加载，不增加仓库体积
- 社区生态丰富，便于扩展

### 1.3 Three.js 加载策略

```html
<!-- 仅在沉浸模式时动态加载 Three.js -->
<script type="module">
  async function loadImmersiveMode() {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    // 初始化沉浸模式...
  }
</script>
```

- 经典模式页面不加载 Three.js，保持 < 1MB 体积
- 沉浸模式通过动态 `import()` 按需加载
- 加载失败时降级到经典模式

---

## 2. 项目结构

```
constellation/
├── index.html                          # 入口页面
├── css/
│   ├── main.css                        # 全局样式、CSS变量
│   ├── pages.css                       # 页面布局样式
│   └── animations.css                  # 动画定义
├── js/
│   ├── main.js                         # 入口、路由管理
│   ├── store.js                        # 状态管理（共享）
│   ├── renderer/
│   │   ├── canvas.js                   # Canvas 渲染引擎（经典模式）
│   │   ├── star.js                     # 星星渲染与动画（经典模式）
│   │   ├── line.js                     # 连线渲染与动画（经典模式）
│   │   ├── particle.js                 # 粒子系统（经典模式）
│   │   └── background.js              # 背景渲染（经典模式）
│   ├── immersive/                      # 沉浸模式
│   │   ├── starfield.js               # 星场系统（数千颗星星）
│   │   ├── milkyway.js                # 银河渲染
│   │   ├── horizon.js                  # 地平线剪影 + 山峦层叠
│   │   ├── ground.js                   # ⭐ v2.0 草地 + 星光倒影
│   │   ├── controls.js                # 天球相机控制
│   │   ├── constellation3d.js         # 3D星座渲染与交互
│   │   ├── connection-particles.js    # ⭐ v2.0 连线星光粒子效果
│   │   ├── proximity.js               # 接近检测系统
│   │   ├── compass.js                 # 方位指示器
│   │   └── proximity-indicator.js     # 接近指示器
│   ├── game/
│   │   ├── engine.js                   # 经典模式游戏引擎
│   │   ├── immersive-engine.js        # 沉浸模式游戏引擎
│   │   ├── constellation.js           # 星座判定逻辑（共享）
│   │   ├── scoring.js                  # 评分系统（共享）
│   │   └── achievement.js             # 成就系统（共享）
│   ├── ui/
│   │   ├── home.js                     # 主页面（含模式选择）
│   │   ├── level-select.js            # 关卡选择
│   │   ├── gameplay.js                # 经典模式游戏页面
│   │   ├── immersive-gameplay.js      # 沉浸模式游戏页面
│   │   ├── result.js                   # 结算页面（共享）
│   │   └── star-card.js               # ⭐ v2.0 星图卡片组件
│   └── utils/
│       ├── audio.js                    # 音效管理
│       ├── storage.js                  # localStorage 封装
│       ├── math.js                     # 数学工具函数
│       ├── astronomy.js               # 天文坐标转换工具
│       └── webgl-detect.js            # WebGL 支持检测
├── data/
│   ├── constellations.json            # 星座数据（经典+沉浸共享）
│   └── star-catalog.json             # 背景星表数据
└── assets/
    └── icons/                          # SVG图标
```

---

## 3. 核心技术方案

### 3.1 经典模式 UI 修复

#### 3.1.1 顶部信息栏合并

顶部栏将星座名称、英文名、描述和计时器合并在一行，避免描述栏遮挡星星。

---

### 3.2 沉浸模式天球系统

#### 3.2.1 天球渲染架构 ⭐ v3.0 更新

```
Three.js 场景结构：

Scene
├── PerspectiveCamera (FOV 60°, 可缩放距离 300-1200)
├── SkyGroup (天球组，半径 1000)
│   ├── StarField (数千颗星星 Points，动态闪烁)
│   ├── MilkyWay (银河粒子带，东北→西南)
│   ├── ConstellationStars (星座亮星 Mesh + 交互)
│   ├── ConnectionLines (连线圆柱体 + 粒子轨迹)
│   └── ReferenceLines (参考连线，半透明)
├── GroundGroup (地面组) ⭐ v2.0 新增
│   ├── GroundPlane (草地平面)
│   ├── GrassParticles (草叶粒子系统，微风摆动)
│   ├── StarReflections (星光倒影 Points)
│   └── MountainLayers (多层山峦剪影)
│       ├── MountainFront (前景丘陵，最深色)
│       ├── MountainMid (中景山脉，深蓝色调)
│       └── MountainBack (远景高山，与天空融合)
├── CompassMarkers (东南西北标记 Sprite)
└── AmbientLight
```

#### 3.2.2 地面环境系统 (GroundGroup) ⭐ v3.0 更新

**草地平面**：使用 PlaneGeometry 铺设地面，Canvas 动态生成草地纹理。地面高度基于山脉半径重新计算（y=-600）。

```javascript
class Ground {
  constructor(THREE, scene) {
    // 草地平面
    const texture = this.createGrassTexture(THREE);
    const geometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -600;
    scene.add(plane);

    // 草叶粒子
    this.createGrassParticles(THREE, scene);

    // 星光倒影
    this.createStarReflections(THREE, scene);
  }
}
```

**草叶粒子系统**：使用 Points 渲染数千根草叶，通过 ShaderMaterial 或每帧更新实现微风摆动。

```javascript
createGrassParticles(THREE, scene) {
  const count = 5000;
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count); // 每根草的摆动相位

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 200;
    positions[i * 3] = Math.cos(angle) * dist;
    positions[i * 3 + 1] = -600;
    positions[i * 3 + 2] = Math.sin(angle) * dist;
    phases[i] = Math.random() * Math.PI * 2;
  }

  // 每帧更新：positions[i*3] += sin(time + phases[i]) * 0.1
}
```

**星光倒影**：将明亮星星（mag < 3）的坐标镜像到地面以下，用半透明小点渲染。

```javascript
createStarReflections(THREE, scene) {
  // 将天球上 mag < 3 的星星位置镜像到 y = -600 的平面上
  // 使用 PointsMaterial，opacity 极低 (0.05~0.1)
  // 模拟露水反光效果
}
```

**多层山峦剪影**：使用 Canvas 绘制三层不同高度和色调的山峦纹理，贴到三个不同半径的圆柱体上。

```javascript
createMountainLayers(THREE, scene) {
  const layers = [
    { radius: 650, height: 120, baseY: -600, color: '#030308', opacity: 1.0 },   // 前景
    { radius: 750, height: 160, baseY: -580, color: '#050520', opacity: 0.8 },   // 中景
    { radius: 850, height: 200, baseY: -560, color: '#0a0a30', opacity: 0.5 },  // 远景
  ];

  for (const layer of layers) {
    const texture = this.createMountainTexture(THREE, layer);
    const geometry = new THREE.CylinderGeometry(
      layer.radius, layer.radius, layer.height, 64, 1, true
    );
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = layer.baseY;
    scene.add(mesh);
  }
}
```

#### 3.2.3 星场系统 (StarField) ⭐ v3.0 更新

增加动态闪烁效果：每颗星星有独立的闪烁相位和频率。新增地平线淡出功能：低仰角星星根据仰角动态淡出，避免穿模山峦。星座赤纬约束收紧为 > +20°，确保永不落到地面以下。

```javascript
class StarField {
  constructor(THREE, scene, starCatalog) {
    // ... 原有初始化代码 ...

    // 闪烁参数
    this.twinklePhases = new Float32Array(starCatalog.length);
    this.twinkleSpeeds = new Float32Array(starCatalog.length);
    for (let i = 0; i < starCatalog.length; i++) {
      this.twinklePhases[i] = Math.random() * Math.PI * 2;
      this.twinkleSpeeds[i] = 0.5 + Math.random() * 2;
    }
  }

  update(time) {
    // 更新每颗星星的透明度实现闪烁
    const colors = this.points.geometry.attributes.color;
    // 亮度波动：baseBrightness * (0.7 + 0.3 * sin(time * speed + phase))
    // 地平线淡出：低仰角星星根据仰角动态降低透明度
    // fadeFactor = clamp((elevation - fadeStartAngle) / fadeRange, 0, 1)
  }
}
```

#### 3.2.4 连线星光粒子效果 ⭐ v2.0 新增

连线不再使用简单的圆柱体，而是由流动的星光粒子组成的轨迹：

```javascript
class ConnectionParticles {
  constructor(THREE, scene) {
    this.THREE = THREE;
    this.scene = scene;
    this.particleGroups = []; // 每条连线一个粒子组
  }

  addConnection(fromPos, toPos) {
    const particleCount = 50; // 每条连线的粒子数
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount); // 沿连线的偏移量 [0,1]

    for (let i = 0; i < particleCount; i++) {
      offsets[i] = Math.random(); // 初始随机分布
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      color: 0xffd764,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.particleGroups.push({
      points,
      fromPos: fromPos.clone(),
      toPos: toPos.clone(),
      offsets,
      particleCount,
    });
  }

  update(dt) {
    for (const group of this.particleGroups) {
      const positions = group.points.geometry.attributes.position.array;
      for (let i = 0; i < group.particleCount; i++) {
        group.offsets[i] = (group.offsets[i] + dt * 0.3) % 1;
        const t = group.offsets[i];
        positions[i * 3] = group.fromPos.x + (group.toPos.x - group.fromPos.x) * t;
        positions[i * 3 + 1] = group.fromPos.y + (group.toPos.y - group.fromPos.y) * t;
        positions[i * 3 + 2] = group.fromPos.z + (group.toPos.z - group.fromPos.z) * t;
      }
      group.points.geometry.attributes.position.needsUpdate = true;
    }
  }
}
```

#### 3.2.5 星图卡片组件 ⭐ v2.0 新增

星座完成后弹出的优雅星图卡片，使用 HTML/CSS 渲染（非 Three.js），叠加在 3D 场景上方：

```javascript
class StarCard {
  constructor(container, constellationData, seasonName) {
    const card = document.createElement('div');
    card.className = 'star-card glass-panel';
    card.innerHTML = `
      <div class="star-card-constellation">
        <canvas class="star-card-canvas" width="200" height="200"></canvas>
      </div>
      <div class="star-card-info">
        <h2 class="star-card-name">${constellationData.name}</h2>
        <p class="star-card-name-en">${constellationData.nameEn}</p>
        <p class="star-card-season">最佳观测：${seasonName}</p>
        <p class="star-card-story">${constellationData.story}</p>
      </div>
    `;
    container.appendChild(card);

    // 在 Canvas 上绘制星座连线图案
    this.drawConstellation(card.querySelector('.star-card-canvas'), constellationData);
  }

  drawConstellation(canvas, data) {
    const ctx = canvas.getContext('2d');
    // 绘制深蓝背景
    // 绘制星星点
    // 绘制金色连线
    // 添加发光效果
  }
}
```

#### 3.2.6 天球相机控制 (CelestialControls) ⭐ v3.0 更新

自定义相机控制器，模拟真实观星体验：
- 方位角（0-360°）和仰角（12°~85°）
- 惯性滑动（dampingFactor = 0.92）
- 拖拽死区（区分点击和拖拽）
- 距离缩放（300-1200），鼠标滚轮/双指缩放控制相机到原点的距离

#### 3.2.7 接近检测系统 (ProximityDetector)

检测用户视角是否接近目标星座区域，返回 0~1 的接近度值。

#### 3.2.8 渐进式提示系统

根据接近度和时间自动升级提示等级（Level 1→2→3）。

---

### 3.3 天文坐标转换工具

提供赤经/赤纬与3D笛卡尔坐标的双向转换、角距离计算、星等到像素大小的映射、颜色指数到RGB的转换、银道坐标到赤道坐标的转换。

---

### 3.4 WebGL 检测与降级

检测浏览器 WebGL 支持情况，不支持时隐藏沉浸模式入口。

---

### 3.5 沉浸模式游戏引擎

管理沉浸模式的完整游戏流程：初始化场景、渲染循环、星星点击检测、连线逻辑、完成判定、评分计算。

---

### 3.6 星座数据格式扩展

沉浸模式需要额外的天文坐标数据（赤经/赤纬/视星等/颜色指数/边界范围/方位提示/形状提示）。

---

## 4. 状态管理扩展

Store 新增沉浸模式相关状态：

```javascript
this.state = {
  currentPage: 'home',
  gameMode: 'classic',        // 'classic' | 'immersive'
  currentSeason: null,
  currentLevel: null,
  score: 0,
  hintsUsed: 0,
  undoCount: 0,
  timer: 0,
  completedLevels: {},
  achievements: [],
  constellationData: null,
  immersiveSupported: false,
  immersiveViewAngle: { azimuth: 180, elevation: 45 },
};
```

---

## 5. 性能优化方案

### 5.1 经典模式优化
- Canvas 分层渲染
- 离屏 Canvas 预渲染
- requestAnimationFrame
- 脏标记

### 5.2 沉浸模式优化

#### 5.2.1 Three.js 性能优化
- **PointsMaterial**：星星使用 Points 而非独立 Mesh，单次 draw call 渲染数千颗
- **InstancedMesh**：草叶使用实例化渲染（如果使用 Mesh 方案）
- **纹理压缩**：所有纹理使用 Canvas 动态生成，不加载外部图片
- **Frustum Culling**：Three.js 内置视锥裁剪
- **粒子池**：连线粒子使用对象池，避免频繁创建/销毁

#### 5.2.2 移动端适配
- **星星数量降级**：桌面 3000+ → 移动端 1000
- **银河粒子降级**：桌面 5000 → 移动端 2000
- **草叶粒子降级**：桌面 5000 → 移动端 2000
- **星光倒影降级**：桌面端开启，移动端关闭
- **山峦层数降级**：桌面3层 → 移动端2层
- **距离限制**：移动端相机距离不低于 400
- **像素比限制**：`renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`

#### 5.2.3 懒加载
- Three.js 仅在进入沉浸模式时动态 import
- 星表数据按需加载
- 纹理 Canvas 预生成后缓存

---

## 6. 部署方案

### 6.1 GitHub Pages 部署
- 纯静态文件
- Three.js 通过 CDN 加载，不增加仓库体积
- 星表数据 JSON 文件约 200KB（gzip 后约 50KB）

### 6.2 CDN 依赖

| 资源 | CDN | 大小 | 加载时机 |
|------|-----|------|----------|
| Three.js | jsdelivr | ~600KB | 沉浸模式按需加载 |

---

## 7. 变更记录

| 日期 | 变更内容 |
|------|----------|
| v1.0 | 初始技术方案 |
| v1.1 | 修改：经典模式游戏页面顶部信息栏合并，移除独立描述栏 |
| v1.1 | 新增：沉浸模式技术架构（Three.js 天球系统） |
| v1.1 | 新增：天球相机控制（CelestialControls） |
| v1.1 | 新增：接近检测系统（ProximityDetector） |
| v1.1 | 新增：渐进式提示系统 |
| v1.1 | 新增：地平线剪影渲染 |
| v1.1 | 新增：银河渲染 |
| v1.1 | 新增：天文坐标转换工具 |
| v1.1 | 新增：WebGL 检测与降级策略 |
| v1.1 | 新增：背景星表数据格式 |
| v1.1 | 新增：沉浸模式性能优化方案 |
| v2.0 | 新增：地面环境系统（Ground类）——草地平面 + 草叶粒子 + 星光倒影 + 多层山峦剪影 |
| v2.0 | 新增：连线星光粒子效果（ConnectionParticles类）——流动粒子轨迹替代简单圆柱体 |
| v2.0 | 新增：星图卡片组件（StarCard类）——含星座连线图案、神话故事、最佳观测季节 |
| v2.0 | 增强：星场系统增加动态闪烁效果 |
| v2.0 | 增强：山峦剪影升级为三层（前景/中景/远景）层叠渲染 |
| v2.0 | 更新：场景结构新增 GroundGroup，含草地、草叶粒子、星光倒影、多层山峦 |
| v2.0 | 更新：移动端降级策略增加草叶粒子、星光倒影、山峦层数的降级方案 |
| v3.0 | 重构：沉浸模式空间参数全面升级——天球半径 500→1000，星星分布半径 500→1000，银河半径 498→998，山脉圆柱半径 490-498→650-850，相机从原点固定改为可缩放距离 300-1200，俯仰角限制 -10°~90°→12°~85°，FOV 缩放 30°~90° 改为距离缩放 300-1200，星座赤纬约束从 >-45° 收紧为 >+20°（确保永不落到地面以下），新增地平线淡出功能（低仰角星星根据仰角动态淡出），地面高度从 y=-80 调整为 y=-600（基于山脉半径重新计算），草地平面尺寸从 1000×1000 调整为 2000×2000，移动端距离限制从 FOV≥50° 改为距离≥400 |
