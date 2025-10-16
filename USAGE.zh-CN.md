# FinanceMCP-DCTHS 使用指南

## 🎯 快速上手（5分钟）

### 第一步：安装依赖

```bash
cd FinanceMCP-DCTHS
npm install
```

### 第二步：配置 Token

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件
# 将 your_tushare_token_here 替换为你的真实 Token
```

> 📌 **获取 Tushare Token**：访问 https://tushare.pro/ 注册账号即可免费获取

### 第三步：构建项目

```bash
npm run build
```

### 第四步：配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**：
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**：
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**添加配置**：
```json
{
  "mcpServers": {
    "financemcp-dcths": {
      "command": "npx",
      "args": ["-y", "financemcp-dcths"],
      "env": {
        "TUSHARE_TOKEN": "你的_tushare_token"
      }
    }
  }
}
```

### 第五步：重启 Claude Desktop

关闭并重新打开 Claude Desktop，工具即可使用！

---

## 💬 实际对话示例

### 示例 1：查询个股资金流向

**你**：帮我查询一下平安银行（000001.SZ）最近的资金流向情况，使用东财数据源

**Claude 会调用**：
- 工具：`get_stock_moneyflow`
- 参数：
  - `ts_code`: "000001.SZ"
  - `data_source`: "dongcai"

**返回结果示例**：
```
📊 个股资金流向查询结果

数据源：东财
查询条件：000001.SZ

共 20 条数据，显示前 20 条：

### 1. 000001.SZ 平安银行
- **ts_code**: 000001.SZ
- **trade_date**: 20231201
- **buy_sm_vol**: 12345678
- **buy_md_vol**: 23456789
- **buy_lg_vol**: 34567890
- **sell_sm_vol**: 11111111
- **sell_md_vol**: 22222222
- **sell_lg_vol**: 33333333
- **net_mf_vol**: 12345678
...
```

---

### 示例 2：对比两个数据源

**你**：帮我对比一下东财和同花顺关于科技板块的资金流向数据有什么不同

**Claude 会调用两次**：

第一次：
- 工具：`get_block_moneyflow`
- 参数：
  - `data_source`: "dongcai"
  - `trade_date`: "20231201"

第二次：
- 工具：`get_block_moneyflow`
- 参数：
  - `data_source`: "tonghuashun"
  - `trade_date`: "20231201"

然后 Claude 会对比分析两个数据源的差异。

---

### 示例 3：查询板块成分股

**你**：BK0001 这个板块包含哪些股票？用同花顺的数据

**Claude 会调用**：
- 工具：`get_block_member`
- 参数：
  - `block_code`: "BK0001"
  - `data_source`: "tonghuashun"

**返回结果示例**：
```
📊 板块成分查询结果

数据源：同花顺
板块代码：BK0001
成分股数量：50

显示前 50 条：

### 1. 平安银行
- **ts_code**: 000001.SZ
- **block_code**: BK0001
- **name**: 平安银行
- **in_date**: 20200101

### 2. 万科A
- **ts_code**: 000002.SZ
- **block_code**: BK0001
- **name**: 万科A
- **in_date**: 20200101
...
```

---

## 🔍 高级用法

### 1. 时间范围查询

**你**：查询 2023年12月整月的资金流向趋势，使用东财数据

**关键参数**：
- `start_date`: "20231201"
- `end_date`: "20231231"
- `data_source`: "dongcai"

---

### 2. 批量查询多只股票

**你**：帮我查询平安银行、万科A、格力电器这三只股票的资金流向，用同花顺数据

Claude 会自动循环调用三次 `get_stock_moneyflow` 工具。

---

### 3. 查询股票所属板块

**你**：平安银行（000001.SZ）属于哪些板块？用东财数据

**参数**：
- `ts_code`: "000001.SZ"
- `data_source`: "dongcai"

（不传 `block_code`，则返回该股票所属的所有板块）

---

## 🌐 HTTP 模式使用

### 启动 HTTP 服务器

```bash
# 方式1：使用 npm 脚本
npm run start:http

# 方式2：直接运行
node build/httpServer.js

# 方式3：指定端口
PORT=8080 node build/httpServer.js
```

### Claude Desktop 配置（HTTP 模式）

```json
{
  "mcpServers": {
    "financemcp-dcths": {
      "type": "streamableHttp",
      "url": "http://localhost:3000/mcp",
      "timeout": 600,
      "headers": {
        "X-Tushare-Token": "你的_tushare_token"
      }
    }
  }
}
```

### 健康检查

```bash
curl http://localhost:3000/health
```

**返回示例**：
```json
{
  "status": "healthy",
  "transport": "streamable-http",
  "activeSessions": 0,
  "server": "FinanceMCP-DCTHS",
  "version": "1.0.0"
}
```

---

## 🐛 故障排查

### 问题 1：Claude 无法识别工具

**原因**：Claude Desktop 没有重启

**解决**：
1. 完全关闭 Claude Desktop
2. 重新打开
3. 在设置中检查 MCP 服务器状态

---

### 问题 2：提示 Token 错误

**检查清单**：
- ✅ Token 是否正确复制（无多余空格）
- ✅ `.env` 文件是否在项目根目录
- ✅ Claude Desktop 配置文件中 Token 是否正确
- ✅ 是否重启了 Claude Desktop

---

### 问题 3：构建失败

```bash
# 清理并重新构建
rm -rf node_modules build
npm install
npm run build
```

---

### 问题 4：权限不足

**现象**：提示某些接口需要权限

**原因**：Tushare 某些高级接口需要积分权限

**解决**：
1. 访问 [Tushare 积分商城](https://tushare.pro/document/1?doc_id=13)
2. 查看所需积分
3. 完成任务获取积分或购买积分

---

## 📊 数据源对比

### 东财 vs 同花顺

| 特性 | 东财（dongcai） | 同花顺（tonghuashun） |
|------|----------------|---------------------|
| **数据更新速度** | 快 | 中等 |
| **数据颗粒度** | 细 | 细 |
| **历史数据** | 丰富 | 丰富 |
| **板块分类** | 东财分类 | 同花顺分类 |
| **推荐场景** | 短线交易分析 | 中长线投资分析 |

**建议**：同一个查询尝试两个数据源，交叉验证数据准确性！

---

## 🚀 生产部署

### Docker 部署（推荐）

创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build/httpServer.js"]
```

构建并运行：

```bash
docker build -t financemcp-dcths .
docker run -d -p 3000:3000 -e TUSHARE_TOKEN=你的token financemcp-dcths
```

---

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start build/httpServer.js --name financemcp-dcths

# 开机自启
pm2 startup
pm2 save
```

---

## 📞 获取帮助

- 🐛 **Bug 报告**：[GitHub Issues](https://github.com/guangxiangdebizi/FinanceMCP-DCTHS/issues)
- 💬 **使用讨论**：[GitHub Discussions](https://github.com/guangxiangdebizi/FinanceMCP-DCTHS/discussions)
- 📧 **邮件联系**：guangxiangdebizi@gmail.com

---

**祝你使用愉快！📈**

