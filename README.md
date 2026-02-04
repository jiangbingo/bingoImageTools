<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Bingo Image Tools

专业的 AI 图片处理工具集，支持抠图、证件照、放大、老照片修复等多种功能。

---

## 特性

- **🤖 AI 驱动** - 支持 Google Gemini 和智谱 AI 双引擎
- **🌐 多语言** - 中文/英文双语界面
- **⚡ 极速处理** - 基于 Vite 构建，秒级响应
- **🔒 安全部署** - API Key 通过环境变量管理，不暴露在前端
- **📱 响应式** - 完美支持桌面和移动设备

---

## 功能列表

| 功能 | 描述 |
|------|------|
| **📉 压缩图片** | 极速减小体积并保持清晰 |
| **✨ AI 放大** | 智能填补细节，超清重构 |
| **🕰️ 老照片修复** | 划痕消除、上色、画质重塑 |
| **✂️ 去除背景** | 发丝级抠图，支持复杂背景 |
| **🪄 魔术消除** | 路人、水印、杂物无痕涂抹 |
| **👤 证件照** | 全规格支持，智能排版美颜 |
| **📏 调整大小** | 精确像素控制，支持自由裁剪 |
| **🔄 格式转换** | 支持 JPG/PNG/WebP 互相转换 |
| **🎨 文生图** | 想象力变现，支持多种画风 |

---

## 快速开始

### 本地运行

**前置要求：** Node.js 18+

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local`，填入你的 API Key：
   ```env
   # Google Gemini API Key - 本地开发使用（生产环境不需要）
   VITE_GEMINI_API_KEY=你的_Gemini_API_Key

   # 智谱AI API Key - 本地开发和生产环境都使用
   VITE_BIGMODEL_API_KEY=你的_智谱API_Key
   ```

   > **注意**：
   > - 本地开发可同时使用 Gemini 和智谱AI
   > - 生产环境（Vercel）只使用智谱AI，只需配置 `BIGMODEL_API_KEY`

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000

---

## 在线部署

### 一键部署到 Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jiangbingo/bingoimagetools)

**部署前准备**：
在 Vercel 项目设置中配置环境变量：
- `BIGMODEL_API_KEY` = 你的智谱API Key

> **注意**：生产环境只需要智谱AI API Key，无需配置 Gemini API

详细部署步骤请查看 **[部署指南](DEPLOYMENT.md)**

### 其他平台

本项目基于 Vite 构建，可以部署到任何支持静态网站托管的平台：

- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- **自建服务器**

---

## 项目结构

```
bingoimagetools/
├── api/                    # Vercel Edge Functions
│   └── ai.ts              # AI API 代理（保护 API Key）
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── App.tsx           # 主应用
│   ├── geminiService.ts  # Gemini 服务封装
│   └── bigmodelService.ts # 智谱AI 服务封装
├── .env.example          # 环境变量模板
├── vercel.json          # Vercel 配置
├── vite.config.ts       # Vite 配置
└── package.json         # 项目配置
```

---

## 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 6
- **样式**：Tailwind CSS
- **AI**：Google Gemini 2.5 Flash / 智谱AI CogView
- **部署**：Vercel

---

## 获取 API Key

### Google Gemini API（仅本地开发）

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 复制到本地 `.env.local` 文件
4. **生产环境不需要此 Key**

### 智谱AI API（本地 + 生产）

1. 访问 [智谱AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 在控制台创建 API Key
4. 复制到 `.env.local`

---

## 安全说明

- ✅ `.env.local` 已在 `.gitignore` 中，不会被提交到 Git
- ✅ API Key 通过环境变量注入，不会硬编码在代码中
- ✅ 生产环境使用 Vercel Edge Functions 保护 API Key
- ⚠️ **永远不要**将 `.env.local` 或包含真实 API Key 的文件提交到公开仓库

---

## 构建命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 常见问题

<details>
<summary><b>Q: 本地开发和生产环境使用什么 AI 服务？</b></summary>

A: 本地开发可以同时使用 Gemini 和智谱AI；生产环境（Vercel）只使用智谱AI。
</details>

<details>
<summary><b>Q: 部署后 API 调用失败？</b></summary>

A: 检查：
1. Vercel 环境变量 `BIGMODEL_API_KEY` 是否正确配置
2. API Key 是否有效且有足够额度
3. 重新部署项目使环境变量生效
</details>

<details>
<summary><b>Q: 为什么生产环境不使用 Gemini？</b></summary>

A: 为了简化部署配置和降低成本，生产环境统一使用智谱AI。
</details>

<details>
<summary><b>Q: 可以使用其他 AI 服务吗？</b></summary>

A: 可以。参考 `src/geminiService.ts` 和 `src/bigmodelService.ts` 的接口实现，添加新的服务类。
</details>

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 许可证

MIT License

---

## 链接

- [在线演示](https://your-project.vercel.app)
- [部署指南](DEPLOYMENT.md)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/jiangbingo">Jiangbingo</a>
</div>
