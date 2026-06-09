#!/bin/bash
# 飞书多维表格 → Cloudflare D1 数据同步脚本
# 使用 lark-cli 导出飞书数据，转换为 SQL 并导入 D1

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SCRIPT_DIR/sync-config.json"
DB_NAME="logistics-portal-db"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查依赖
check_deps() {
  if ! command -v lark-cli &> /dev/null; then
    log_error "lark-cli 未安装，请先安装: npm install -g @larksuite/cli"
    exit 1
  fi

  if ! command -v npx &> /dev/null; then
    log_error "npx 未找到，请确保 Node.js 已安装"
    exit 1
  fi

  if [ ! -f "$CONFIG_FILE" ]; then
    log_error "配置文件不存在: $CONFIG_FILE"
    exit 1
  fi
}

# 从飞书导出表格数据为 CSV
export_feishu_table() {
  local app_token=$1
  local table_id=$2
  local output_file=$3

  log_info "导出飞书表格: app_token=$app_token, table_id=$table_id"

  lark-cli bitable record list \
    --app-token "$app_token" \
    --table-id "$table_id" \
    --format csv \
    > "$output_file" 2>/dev/null

  if [ $? -ne 0 ]; then
    log_error "导出失败: app_token=$app_token, table_id=$table_id"
    return 1
  fi

  log_info "导出成功: $output_file ($(wc -l < "$output_file") 行)"
}

# CSV 转 SQL INSERT 语句
csv_to_sql() {
  local csv_file=$1
  local table_name=$2
  local field_mapping=$3
  local sql_file="${csv_file%.csv}.sql"

  log_info "转换 CSV → SQL: $csv_file → $sql_file"

  # 使用 Node.js 脚本处理 CSV 到 SQL 的转换
  node -e "
    const fs = require('fs');
    const csv = fs.readFileSync('$csv_file', 'utf-8');
    const lines = csv.trim().split('\n');
    if (lines.length < 2) { process.exit(0); }

    const headers = lines[0].split(',').map(h => h.trim().replace(/\"/g, ''));
    const mapping = $field_mapping;

    const dbFields = Object.values(mapping);
    const headerIndices = Object.keys(mapping).map(k => headers.indexOf(k));

    let sql = '';
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/\"/g, ''));
      const dbValues = headerIndices.map(idx => {
        const val = idx >= 0 && idx < values.length ? values[idx] : '';
        return val === '' ? 'NULL' : \"'\" + val.replace(/'/g, \"''\") + \"'\";
      });
      sql += \`INSERT INTO $table_name (\${dbFields.join(', ')}) VALUES (\${dbValues.join(', ')});\n\`;
    }

    fs.writeFileSync('$sql_file', sql);
    console.log('Generated ' + (lines.length - 1) + ' INSERT statements');
  "

  echo "$sql_file"
}

# 导入 SQL 到 D1
import_to_d1() {
  local sql_file=$1
  local remote_flag=${2:-"--remote"}

  log_info "导入 SQL 到 D1: $sql_file ($remote_flag)"

  npx wrangler d1 execute "$DB_NAME" $remote_flag --file="$sql_file"

  if [ $? -eq 0 ]; then
    log_info "导入成功"
  else
    log_error "导入失败"
    return 1
  fi
}

# 主流程
main() {
  check_deps

  local remote_flag="--remote"
  if [ "$1" = "--local" ]; then
    remote_flag="--local"
    log_info "使用本地 D1 数据库"
  fi

  log_info "开始数据同步..."

  # 读取配置并逐表处理
  # 注意：需要手动配置 sync-config.json 中的飞书表格信息
  log_warn "请确保 sync-config.json 中已配置飞书表格的 app_token 和 table_id"
  log_warn "当前脚本为模板，需要根据实际飞书表格结构调整"

  # 示例：手动指定表格同步
  # export_feishu_table "YOUR_APP_TOKEN" "YOUR_TABLE_ID" "/tmp/ups_prices.csv"
  # csv_to_sql "/tmp/ups_prices.csv" "ups_prices" '{"价格类型":"price_type","代理名称":"agent_name"}'
  # import_to_d1 "/tmp/ups_prices.sql" "$remote_flag"

  log_info "同步完成"
  log_info "如需自动同步，请编辑此脚本并填入飞书表格信息"
}

main "$@"
