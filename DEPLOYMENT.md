# 部署指南

本文档介绍如何将 Bingo Image Tools 部署到 Vercel。

---

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [环境变量配置](#环境变量配置)
- [本地开发](#本地开发)
- [故障排除](#故障排除)

---

## 前置要求

1. **GitHub 账号** - 用于代码托管
2. **Vercel 账号** - 用于部署（可用 GitHub 账号登录）
3. **AI API 密钥**：
   - [智谱AI API Key](https://open.bigmodel.cn/)

---

## 快速开始

### 方式一：通过 Vercel Dashboard 部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/bingoimagetools.git
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [vercel.com/new](https://vercel.com/new)
   - 选择你的 GitHub 仓库
   - Vercel 会自动识别 Vite 项目

3. **配置环境变量**
   在项目设置中添加以下环境变量：

   | 名称 | 值 | 必需 |
   |------|-----|------|
   | `BIGMODEL_API_KEY` | 你的智谱API Key | **必需** |

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约 1-2 分钟）
   - 访问生成的 URL

---

### 方式二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **配置环境变量**
   ```bash
   vercel env add BIGMODEL_API_KEY
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

---

## 详细步骤

### 第一步：准备本地环境

1. **克隆仓库**（如果还没有）
   ```bash
   git clone https://github.com/your-username/bingoimagetools.git
   cd bingoimagetools
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置本地环境变量**
   ```bash
   cp .env.example .env.local
   ```

   编辑 `.env.local`：
   ```env
   # 智谱AI API Key
   VITE_BIGMODEL_API_KEY=你的_智谱API_Key
   ```

4. **测试本地运行**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000 确认应用正常运行

---

### 第二步：提交代码到 GitHub

1. **创建 `.gitignore`**（已完成）
   - 确认 `.env.local` 和 `*.local` 已添加
   - 确认敏感文件不会被提交

2. **初始化 Git 仓库**（如果还没有）
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit - Bingo Image Tools"
   ```

3. **推送到 GitHub**
   ```bash
   # 在 GitHub 上创建新仓库后
   git remote add origin https://github.com/your-username/bingoimagetools.git
   git branch -M main
   git push -u origin main
   ```

---

### 第三步：在 Vercel 部署

1. **导入项目**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

2. **配置项目**

   **基本配置**：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   **环境变量**：
   点击 "Environment Variables" 添加：

   ```
   BIGMODEL_API_KEY = 你的_智谱API_Key
   ```

3. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成
   - 部署成功后会获得一个 URL：`https://your-project.vercel.app`

---

## 环境变量配置

### 本地开发环境

```env
VITE_BIGMODEL_API_KEY=你的_智谱API_Key
```

### 生产环境（Vercel）

```
BIGMODEL_API_KEY = 你的_智谱API_Key
```

### 获取智谱AI API Key

1. 访问 [智谱AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 在控制台创建 API Key
4. 复制并保存

### 在 Vercel 配置

**通过 Dashboard**：
1. 进入项目设置 → Environment Variables
2. 添加变量：
   - Key: `BIGMODEL_API_KEY`, Value: `你的智谱API密钥`
3. 选择环境（Production / Preview / Development）
4. 保存并重新部署

**通过 CLI**：
```bash
# 生产环境
vercel env add BIGMODEL_API_KEY production

# 预览环境
vercel env add BIGMODEL_API_KEY preview
```

---

## 本地开发

### 安装依赖
```bash
npm install
```

### 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
VITE_BIGMODEL_API_KEY=你的_智谱API_Key
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
npm run preview
```

---

## 故障排除

### 构建失败

**问题**：`npm install` 失败
```bash
# 清理缓存重试
rm -rf node_modules package-lock.json
npm install
```

**问题**：TypeScript 类型错误
```bash
# 检查类型错误
npm run build
```

### 部署后 API 调用失败

**问题**：API 调用返回 401/403
- 检查环境变量是否正确配置
- 确认 API Key 有效且有足够额度
- 在 Vercel Dashboard → Environment Variables 检查配置

**问题**：CORS 错误
- 确保 Edge Function 正确配置
- 检查 `vercel.json` 中的 rewrites 配置

### 环境变量未生效

1. **确认变量名称**：`BIGMODEL_API_KEY` 不是其他名称
2. **重新部署**：修改环境变量后必须重新部署
   ```bash
   vercel --prod
   ```
3. **检查作用域**：确认变量添加到了正确的环境（Production）

---

## 项目结构

```
bingoimagetools/
├── api/                    # Vercel Edge Functions
│   └── ai.ts              # AI API 代理（保护 API Key）
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── App.tsx           # 主应用
│   └── bigmodelService.ts # 智谱AI 服务封装
├── .env.example          # 环境变量模板
├── .gitignore           # Git 忽略文件
├── vercel.json          # Vercel 配置
├── vite.config.ts       # Vite 配置
├── package.json         # 项目配置
└── DEPLOYMENT.md        # 本文档
```

---

## 安全最佳实践

1. **永远不要提交 `.env.local`**
   - 已在 `.gitignore` 中配置
   - 使用 `.env.example` 作为模板

2. **使用环境变量**
   - API Key 通过 Vercel 环境变量注入
   - 不要在代码中硬编码

3. **API Key 轮换**
   - 定期更换 API Key
   - 如果泄露立即撤销并重新生成

4. **限制 API Key 权限**
   - 使用最小权限原则
   - 为不同环境使用不同的 Key

---

## 更新部署

每次推送代码到 main 分支，Vercel 会自动部署：

```bash
git add .
git commit -m "feat: 新功能描述"
git push origin main
```

### 预览部署

每个 Pull Request 都会自动生成预览链接，方便测试。

---

## 域名配置（可选）

### 使用自定义域名

1. **在 Vercel Dashboard**：
   - 进入项目 → Settings → Domains
   - 添加你的域名
   - 按照 DNS 配置指引添加记录

2. **DNS 配置**：
   ```
   A    yourdomain.com     76.76.21.21
   CNAME www              cname.vercel-dns.com
   ```

---

## 监控和日志

### Vercel Analytics
自动启用，访问 Vercel Dashboard 查看访问统计。

### Edge Function 日志
```bash
vercel logs
```

### 构建日志
在 Vercel Dashboard → Deployments 查看详细日志。

---

## 成本估算

### Vercel 免费额度
- **带宽**：100 GB/月
- **执行时间**：100 小时/月
- **请求数**：无限

### AI API 成本
- **智谱AI CogView**：新用户有免费额度

详见各平台定价页面。

---

## 常见问题

<details>
<summary><b>Q: 部署后页面空白？</b></summary>

A: 检查：
1. 构建是否成功（查看 Vercel 部署日志）
2. 浏览器控制台是否有错误
3. 环境变量是否正确配置
</details>

<details>
<summary><b>Q: 如何回滚到之前的版本？</b></summary>

A: 在 Vercel Dashboard → Deployments，找到之前的版本，点击 "Promote to Production"。
</details>

<details>
<summary><b>Q: 可以部署到其他平台吗？</b></summary>

A: 可以。本项目基于 Vite 构建，可以部署到：
- Netlify
- Cloudflare Pages
- GitHub Pages
- 任何支持静态网站托管的服务

但 Edge Functions 需要相应调整。
</details>

---

## 获取帮助

- **Vercel 文档**：[vercel.com/docs](https://vercel.com/docs)
- **Vercel 社区**：[github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **智谱AI 文档**：[open.bigmodel.cn](https://open.bigmodel.cn/dev/api)

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
