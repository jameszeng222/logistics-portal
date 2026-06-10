# 物流工具站功能扩展设计

## 背景

物流部内部工具站（3-10人），用于跨境电商出口物流的日常数据查询和工具使用。现有功能：价格管理、工具箱、供应商考核。本次扩展新增发货记录台账和单据生成器。

## 功能一：发货记录台账

### 目的
替代 Excel 表格，集中管理发货数据，方便统计查询和后续单据生成。

### 数据模型

```
shipments 表:
  id            TEXT PRIMARY KEY
  date          TEXT NOT NULL          -- 发货日期 YYYY-MM-DD
  brand         TEXT NOT NULL          -- 品牌 (LM / LM-TT / FD / FD-TT)
  channel       TEXT NOT NULL          -- 渠道 (UPS / 空运 / 海运)
  provider      TEXT NOT NULL          -- 服务商
  destination   TEXT NOT NULL          -- 目的地国家
  tracking_no   TEXT                   -- 追踪号
  pieces        INTEGER NOT NULL       -- 件数
  actual_weight REAL                   -- 实重 kg
  vol_weight    REAL                   -- 体积重 kg
  charge_weight REAL                   -- 计费重量 kg
  freight_cost  REAL                   -- 运费
  extra_cost    REAL DEFAULT 0         -- 附加费
  total_cost    REAL                   -- 总费用
  currency      TEXT DEFAULT 'CNY'     -- 币种
  remark        TEXT                   -- 备注
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
```

### 页面结构

**路由：** `/shipments`

**子页面：**
- `/shipments` - 发货记录列表（主页面）
- `/shipments/new` - 手动新增发货记录
- `/shipments/[id]` - 记录详情/编辑
- `/shipments/import` - Excel 批量导入
- `/shipments/stats` - 统计汇总

### 功能详情

1. **列表页**
   - 表格展示，支持分页
   - 筛选：日期范围、品牌、渠道、服务商、目的地
   - 搜索：追踪号、服务商名
   - 批量删除

2. **手动录入**
   - 表单填写所有字段
   - 品牌和渠道下拉选择
   - 服务商根据渠道自动筛选
   - 体积重自动计算（输入尺寸后）

3. **Excel 导入**
   - 上传 .xlsx 文件
   - 预览解析结果，用户确认字段映射
   - 支持服务商账单格式（UPS/云途/华贸等常见格式）
   - 导入前校验，显示错误行

4. **统计汇总**
   - 按月/季/年汇总发货量、运费
   - 按品牌/渠道/服务商分组统计
   - 简单图表（柱状图 + 饼图）

### API 路由

- `GET /api/shipments` - 列表查询（支持筛选参数）
- `POST /api/shipments` - 新增记录
- `PUT /api/shipments/[id]` - 更新记录
- `DELETE /api/shipments/[id]` - 删除记录
- `POST /api/shipments/import` - Excel 导入
- `GET /api/shipments/stats` - 统计数据

### 侧边栏位置

放在"价格管理"和"工具箱"之间，作为独立一级分组：

```
价格管理
  UPS价格
  空运价格
  海运价格
发货记录
  发货台账
  批量导入
  统计汇总
工具箱
  体积计算器
  箱规查询
供应商考核
  时效考核
  验货考核
  综合考核
  服务商列表
```

---

## 功能二：单据生成器

### 目的
在线填写信息，一键生成标准单据 PDF，减少重复手工操作。

### 数据模型

```
document_templates 表:
  id            TEXT PRIMARY KEY
  name          TEXT NOT NULL          -- 模板名称
  type          TEXT NOT NULL          -- packing_list / commercial_invoice / customs / forwarder_invoice
  fields        TEXT NOT NULL          -- JSON: 模板字段定义
  layout        TEXT NOT NULL          -- JSON: PDF 布局配置
  is_default    INTEGER DEFAULT 0      -- 是否默认模板
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
  updated_at    TEXT DEFAULT CURRENT_TIMESTAMP

documents 表:
  id            TEXT PRIMARY KEY
  template_id   TEXT NOT NULL          -- 关联模板
  type          TEXT NOT NULL          -- 单据类型
  data          TEXT NOT NULL          -- JSON: 填写的数据
  pdf_url       TEXT                   -- 生成后的 PDF 路径
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
```

### 页面结构

**路由：** `/documents`

**子页面：**
- `/documents` - 单据列表
- `/documents/generate` - 选择模板并填写
- `/documents/templates` - 模板管理

### 功能详情

1. **装箱单（Packing List）**
   - 填写：发货人、收货人、每箱品名/数量/毛重/净重/尺寸
   - 生成标准格式 PDF

2. **商业发票（Commercial Invoice）**
   - 填写：卖方/买方信息、品名/数量/单价/总价/贸易条款
   - 生成报关用发票 PDF

3. **报关草单**
   - 填写：收发货人、商品信息、HS 编码、数量/金额
   - 生成给报关行参考的格式

4. **货代发票模板**
   - 支持自定义模板：字段名称、布局、Logo 位置
   - 可保存多套模板，不同货代用不同格式
   - 填写数据后套用模板生成

### 技术方案

- PDF 生成：使用 `@react-pdf/renderer` 或服务端 `puppeteer`（考虑到 Cloudflare 环境，优先用 `@react-pdf/renderer`）
- 模板存储：D1 数据库存 JSON 配置
- PDF 下载：生成后直接下载，不存储文件

### 侧边栏位置

放在"工具箱"下新增子项：

```
工具箱
  体积计算器
  箱规查询
  单据生成
  模板管理
```

---

## 技术约束

- 部署环境：Cloudflare Pages + D1 数据库
- 前端：Next.js + Tailwind + shadcn/ui
- PDF 生成需兼容 Cloudflare Workers 运行时（无 Node.js fs）
- Excel 解析使用浏览器端库（如 SheetJS/xlsx）

## 实施顺序

1. 发货记录台账（数据模型 + 列表 + 手动录入）
2. 发货记录台账（Excel 导入 + 统计汇总）
3. 单据生成器（装箱单 + 商业发票）
4. 单据生成器（报关草单 + 货代自定义模板）
