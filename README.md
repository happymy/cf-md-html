# cf-md-html

Cloudflare Worker 部署的在线 Markdown 文档阅读器。零持久化、强匿名。

## 特性

- 纯客户端渲染，**无数据持久化** — 关闭页面后所有数据丢失
- **强匿名性** — 无 Cookie、无追踪、无请求日志、无第三方资源
- 页面加载后无外部请求（Mermaid 流程图按需从 CDN 动态加载，属已知例外）
- 拖放 / 粘贴 / Ctrl+O 打开 .md 文件
- 自动跟随系统暗黑模式，支持手动切换
- 左右编辑/预览栏可拖拽调整宽度，可隐藏左栏
- 语法高亮（JS/TS/Python/Rust/Go/Bash/CSS/JSON/XML/SQL/Markdown）
- GFM 扩展：删除线、表格、脚注、任务列表、定义列表、上下标、缩写

## 使用

```bash
npm install
npm run dev      # 本地预览（wrangler dev）
npm run deploy   # 构建并部署到 Cloudflare Workers
```

## 安全

- CSP: `default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline' https://cdn.jsdelivr.net/npm/mermaid@11/; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none';`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- 代码块语言属性经 HTML 转义，防 XSS

## 技术栈

- Cloudflare Workers
- markdown-it + markdown-it-footnote + markdown-it-task-lists + markdown-it-strikethrough-alt + markdown-it-deflist + markdown-it-abbr + markdown-it-sup + markdown-it-sub
- highlight.js（按需加载 11 种语言）
- esbuild 内联打包
