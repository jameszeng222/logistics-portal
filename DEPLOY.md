# 物流部管理系统 - 部署指南

## 前置条件

1. Node.js >= 20
2. Cloudflare 账户
3. GitHub 账户
4. Wrangler CLI 已登录 (`npx wrangler login`)

## 部署步骤

### 1. 创建 GitHub 仓库

```bash
# 在 GitHub 上创建仓库 logistics-portal，然后：
cd logistics-portal
git remote add origin https://github.com/<你的用户名>/logistics-portal.git
git branch -M main
git push -u origin main
```

### 2. 创建 D1 数据库

```bash
npx wrangler d1 create logistics-portal-db
```

将返回的 `database_id` 更新到 `wrangler.jsonc` 中的 `d1_databases[0].database_id` 字段。

### 3. 执行数据库迁移

```bash
# 远程执行迁移
npx wrangler d1 execute logistics-portal-db --remote --file=drizzle/0000_same_ultragirl.sql

# 导入种子数据
npx wrangler d1 execute logistics-portal-db --remote --file=scripts/seed.sql
```

### 4. 连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择 GitHub 仓库 `logistics-portal`
4. 配置构建设置：
   - **Framework preset**: Next.js
   - **Build command**: `npx @opennextjs/cloudflare`
   - **Build output directory**: `.open-next/assets`
5. 添加环境变量：
   - `NODE_VERSION` = `20`
6. 点击 **Save and Deploy**

### 5. 配置 D1 Binding

1. 进入 Pages 项目 → **Settings** → **Functions**
2. 在 **D1 database bindings** 中添加：
   - Variable name: `DB`
   - D1 database: 选择 `logistics-portal-db`
3. 在 **Compatibility flags** 中添加：`nodejs_compat`
4. **Compatibility date** 设为 `2026-06-09` 或更新

### 6. 重新部署

配置完成后，在 GitHub 推送一次新提交触发重新部署：

```bash
git commit --allow-empty -m "trigger redeploy with D1 binding"
git push
```

## GitHub Actions 自动部署

项目已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），推送到 `main` 分支时会自动构建并部署到 Cloudflare Workers。

### 工作流流程

1. 触发条件：推送到 `main` 分支
2. 检出代码 → 设置 Node.js 20 → 安装依赖 → 构建 → 部署

### 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets（**Settings → Secrets and variables → Actions → New repository secret**）：

| Secret 名称 | 说明 | 示例值 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌（需有 Workers 编辑权限） | 在 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) 创建 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | `e127afc38633e1411484b05a142f554f` |

#### 创建 Cloudflare API Token

1. 登录 [Cloudflare API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板
4. 确认权限包含：
   - Account - Workers Scripts - Edit
   - Account - Workers KV Storage - Edit（如使用 KV）
   - Zone - Workers Routes - Edit（如配置路由）
5. 创建后复制令牌值，添加为 GitHub Secret `CLOUDFLARE_API_TOKEN`

### 手动触发部署

如需手动触发部署，可在 GitHub 仓库的 **Actions** 页面选择工作流并点击 **Run workflow**（需在 `deploy.yml` 中添加 `workflow_dispatch` 触发器）。

## 本地开发

```bash
# 安装依赖
npm install

# 本地执行数据库迁移
npx wrangler d1 execute logistics-portal-db --local --file=drizzle/0000_same_ultragirl.sql
npx wrangler d1 execute logistics-portal-db --local --file=scripts/seed.sql

# 启动开发服务器
npm run dev

# 模拟 Cloudflare 环境
npm run preview
```

## 数据同步（飞书 → D1）

```bash
# 使用同步脚本从飞书导出数据并导入 D1
bash scripts/sync-from-feishu.sh
```

详见 `scripts/sync-config.json` 配置飞书表格映射。
