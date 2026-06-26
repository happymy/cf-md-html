# MD Reader — CF Worker 在线 Markdown 阅读器

## 项目概述

纯前端 Markdown 文档阅读器，部署于 Cloudflare Worker。**不保存任何数据**，关闭页面数据即丢失。强匿名：无 Cookie、无追踪、无后端日志。

## 核心原则

- **无持久化** — 不用 KV、D1、R2、DO。所有数据存活于内存，页面关闭即销毁
- **强匿名** — 不写 Cookie、不采集任何信息、Worker 不记录请求日志、响应头无追踪标识
- **最小依赖** — 能内联的内联，能 client-side 的绝不 server-side

## 技术方案

| 层面 | 选型 | 理由 |
|------|------|------|
| 运行时 | CF Workers | 需求明确 |
| 渲染引擎 | **markdown-it** (client-side) | 严格 CommonMark 规范 + GFM 扩展，规则级可配置 |
| 语法高亮 | highlight.js | 语言覆盖面广，自动识别 |
| 扩展插件 | markdown-it-gfm / -footnote | 覆盖 GFM 全语法 + 脚注 |
| UI 框架 | 无，原生 HTML/CSS/JS | 零依赖 |
| 样式 | GitHub-markdown 主题 CSS | 开箱即用的阅读体验 |
| 部署 | `wrangler deploy` | 标准流程 |

### 为什么选 markdown-it 而非 marked

需要极高的 Markdown 语法兼容性和精确解析时，markdown-it 是更优选择：

| 对比项 | markdown-it | marked |
|--------|-------------|--------|
| CommonMark 规范符合度 | 严格遵循（官方 benchmark 全绿） | 基本遵循，边缘场景有偏差 |
| 嵌套语法（列表内代码块、块引用内嵌套等） | 精确处理 | 部分复杂嵌套渲染错误 |
| 规则级控制 | ✅ 可开启/关闭/替换单个解析规则 | ❌ 不支持 |
| 插件生态 | 丰富稳定，GFM/脚注/任务列表等 | 插件较少 |
| XSS 防护 | 内置 badgate 过滤器 | 需自行处理 |

## 功能清单

### MVP
- [ ] 粘贴 Markdown 文本 → 实时渲染预览
- [ ] 拖拽 / 选择 `.md` 文件 → 读取并渲染
- [ ] 浅色/深色主题切换
- [ ] 响应式布局（桌面 + 移动端）

### V2（可选）
- [ ] 导出为 HTML
- [ ] 分享（URL hash 编码内容，不经过服务端）
- [ ] TOC 目录导航
- [ ] 代码块复制按钮
- [ ] 快捷键（Ctrl+O 打开文件等）

### 不做
- ❌ 用户账号 / 登录
- ❌ 数据保存到服务端
- ❌ 历史记录
- ❌ 分析 / 统计 / 埋点

## 数据流

```text
用户粘贴/拖拽/选择文件
    │
    ▼
浏览器读取文件内容（FileReader）
    │
    ▼
markdown-it.parse(content) → tokens → HTML
  ├─ 插件链处理（GFM / 脚注...）
  └─ highlight.js 代码块着色
    │
    ▼
注入到预览容器
    │
    ▼
仅浏览器内存，无网络请求（Worker 仅首次返回 HTML）
```

**Worker 角色**：仅返回静态 HTML 页面，后续全部在浏览器端完成。

## 路由设计

```
/               → 阅读器页面（SPA，全部内联）
```

单一路由，Worker fetch 直接返回 HTML。

## 安全与匿名

- Worker 不记录任何请求日志
- 无 Cookie 设置
- 无第三方资源加载（markdown-it / highlight.js 打包进 HTML；Mermaid 因体积 3.8MB 无法内联，例外地从 CDN 动态加载）
- 不采集 IP / User-Agent（注：Mermaid CDN 加载会暴露用户 IP，属已知例外）
- 响应头设 `X-Content-Type-Options: nosniff` `Referrer-Policy: no-referrer`
- CSP 限制到最小权限（内联 script/style + Mermaid CDN 白名单）

## 项目结构

```
md-reader/
├── src/
│   └── worker.js         # Worker 入口，返回 HTML
├── static/
│   └── index.html        # 主页面（含内联 CSS/JS）
├── wrangler.toml         # CF Worker 配置
└── package.json          # markdown-it + plugins + highlight.js
```

## 构建策略

使用 `wrangler deploy` 部署。构建时通过 build script 将 markdown-it、highlight.js 及其插件打包进 HTML 中内联，Worker 运行时零外部依赖加载。

## 验收标准

1. `wrangler deploy` 后可访问
2. 粘贴 Markdown 实时渲染
3. 拖拽 `.md` 文件读取并渲染
4. 浅色/深色切换正常
5. **复杂语法**：表格、脚注、嵌套列表、围栏代码块、删除线、URL 自动链接均渲染正确
6. 刷新页面或关闭重开 → 数据消失（无持久化）
7. 浏览器 DevTools 无 Cookie、除 Mermaid CDN 外无外部请求
8. Lighthouse 无隐私 / 安全告警
