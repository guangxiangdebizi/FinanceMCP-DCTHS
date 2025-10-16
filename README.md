# FinanceMCP-DCTHS

[![npm version](https://img.shields.io/npm/v/financemcp-dcths.svg)](https://www.npmjs.com/package/financemcp-dcths)
[![License](https://img.shields.io/npm/l/financemcp-dcths.svg)](https://github.com/guangxiangdebizi/FinanceMCP-DCTHS/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/financemcp-dcths.svg)](https://www.npmjs.com/package/financemcp-dcths)

> 基于 MCP 协议的金融数据服务器，集成 Tushare API，支持东财和同花顺数据源

## 📋 功能特性

### 🎯 三大核心工具

1. **个股资金流向** (`get_stock_moneyflow`)
   - 支持东财（DongCai）数据源
   - 支持同花顺（TongHuaShun）数据源
   - 可按股票代码、日期查询

2. **板块资金流向** (`get_block_moneyflow`)
   - 支持东财（DongCai）数据源
   - 支持同花顺（TongHuaShun）数据源
   - 可按板块代码、日期查询

3. **板块成分** (`get_block_member`)
   - 支持东财（DongCai）数据源
   - 支持同花顺（TongHuaShun）数据源
   - 可查询板块成分股或股票所属板块

### 🔧 两种部署模式

| 特性 | stdio 模式 | HTTP 模式 |
|------|-----------|-----------|
| **适用场景** | 本地使用 | 服务器部署 |
| **启动方式** | `npx -y financemcp-dcths` | `node build/httpServer.js` |
| **Token 配置** | 环境变量 | 环境变量 + HTTP Header |
| **推荐用途** | 个人使用、快速测试 | 生产部署、多用户 |

## 🚀 快速开始

### 方式一：直接使用（推荐）⭐

无需安装，直接使用 npx：

```bash
npx -y financemcp-dcths
```

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/guangxiangdebizi/FinanceMCP-DCTHS.git
cd FinanceMCP-DCTHS

# 安装依赖
npm install
```

### 🔑 配置 Tushare Token

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Tushare Token：
```env
TUSHARE_TOKEN=你的tushare_token
```

> **获取 Token**：访问 [Tushare 官网](https://tushare.pro/) 注册并获取免费 Token

### 🔨 构建项目

```bash
npm run build
```

### ▶️ 运行服务器

#### stdio 模式（推荐本地使用）⭐

```bash
npm run start:stdio
```

或通过 npx 直接运行：
```bash
npx -y financemcp-dcths
```

#### HTTP 模式（服务器部署）

```bash
npm run start:http
```

服务器将在 `http://localhost:3000` 启动

## 📱 客户端配置

### ⭐ stdio 模式配置（推荐）

在 Claude Desktop 配置文件中添加：

**位置**：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**配置内容**：
```json
{
  "mcpServers": {
    "financemcp-dcths": {
      "command": "npx",
      "args": ["-y", "financemcp-dcths"],
      "env": {
        "TUSHARE_TOKEN": "你的tushare_token"
      }
    }
  }
}
```

### 🌐 HTTP 模式配置

```json
{
  "mcpServers": {
    "financemcp-dcths": {
      "type": "streamableHttp",
      "url": "http://localhost:3000/mcp",
      "timeout": 600,
      "headers": {
        "X-Tushare-Token": "你的tushare_token"
      }
    }
  }
}
```

**HTTP 模式支持三种 Token 传递方式：**

1. ✅ `X-Tushare-Token` 请求头（推荐）
2. ✅ `X-Api-Key` 请求头
3. ✅ `Authorization: Bearer <token>` 请求头

## 💡 使用示例

### 示例 1：查询平安银行资金流向（东财数据）

在 Claude 中输入：
```
使用东财数据源，查询平安银行（000001.SZ）2023年12月1日的资金流向
```

对应的 MCP 调用：
```json
{
  "name": "get_stock_moneyflow",
  "arguments": {
    "ts_code": "000001.SZ",
    "trade_date": "20231201",
    "data_source": "dongcai"
  }
}
```

### 示例 2：查询板块资金流向（同花顺数据）

在 Claude 中输入：
```
使用同花顺数据源，查询2023年12月所有板块的资金流向
```

对应的 MCP 调用：
```json
{
  "name": "get_block_moneyflow",
  "arguments": {
    "start_date": "20231201",
    "end_date": "20231231",
    "data_source": "tonghuashun"
  }
}
```

### 示例 3：查询板块成分股

在 Claude 中输入：
```
使用东财数据源，查询 BK0001 板块包含哪些股票
```

对应的 MCP 调用：
```json
{
  "name": "get_block_member",
  "arguments": {
    "block_code": "BK0001",
    "data_source": "dongcai"
  }
}
```

## 📚 API 参数说明

### 通用参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `data_source` | string | ✅ | 数据源：`dongcai`（东财）或 `tonghuashun`（同花顺） |

### 个股资金流向参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `ts_code` | string | ❌ | 股票代码 | `000001.SZ`、`600000.SH` |
| `trade_date` | string | ❌ | 交易日期 | `20231201` |
| `start_date` | string | ❌ | 开始日期 | `20231201` |
| `end_date` | string | ❌ | 结束日期 | `20231231` |

### 板块资金流向参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `block_code` | string | ❌ | 板块代码 | `BK0001` |
| `trade_date` | string | ❌ | 交易日期 | `20231201` |
| `start_date` | string | ❌ | 开始日期 | `20231201` |
| `end_date` | string | ❌ | 结束日期 | `20231231` |

### 板块成分参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `ts_code` | string | ❌ | 股票代码（查询该股票所属板块） | `000001.SZ` |
| `block_code` | string | ❌ | 板块代码（查询该板块的成分股） | `BK0001` |

## 🔐 Token 安全建议

- ✅ **本地开发**：使用 `.env` 文件存储 Token（已在 `.gitignore` 中排除）
- ✅ **生产部署**：使用系统环境变量或 Docker secrets
- ✅ **客户端配置**：在客户端配置文件中传递 Token
- ❌ **避免**：不要将 Token 硬编码在代码中或提交到 Git

## 🛠️ 开发指南

### 项目结构

```
src/
├── index.ts              # stdio 模式入口
├── httpServer.ts         # HTTP 模式入口
├── utils/
│   └── tushareClient.ts  # Tushare API 客户端
└── tools/
    ├── moneyflow.ts      # 个股资金流向工具
    ├── blockMoneyflow.ts # 板块资金流向工具
    └── blockMember.ts    # 板块成分工具
```

### 开发模式

```bash
# 监听文件变化，自动编译
npm run watch

# 另开终端运行服务器
npm run dev
```

### 添加新工具

1. 在 `src/tools/` 目录下创建新工具文件
2. 实现工具接口（name, description, parameters, run）
3. 在 `src/index.ts` 和 `src/httpServer.ts` 中导入并注册工具

## 🐛 常见问题

### Q: 提示 "Tushare token is required"

**A**: 检查 Token 配置：
1. stdio 模式：检查环境变量或客户端配置的 `env.TUSHARE_TOKEN`
2. HTTP 模式：检查请求头 `X-Tushare-Token` 或环境变量

### Q: 提示 "Tushare API Error: 权限错误"

**A**: 某些接口需要 Tushare 会员权限，请：
1. 访问 [Tushare 积分商城](https://tushare.pro/document/1?doc_id=13)
2. 查看接口所需积分等级
3. 升级账户权限

### Q: 返回数据为空

**A**: 可能原因：
1. 日期参数错误（非交易日）
2. 股票代码或板块代码错误
3. 该日期没有数据

## 📄 开源协议

Apache-2.0 License - 详见 [LICENSE](./LICENSE) 文件

## 👤 作者

**陈星宇 (Xingyu Chen)**

- **LinkedIn**: [Xingyu Chen](https://www.linkedin.com/in/xingyu-chen-b5b3b0313/)
- **Email**: guangxiangdebizi@gmail.com
- **GitHub**: [@guangxiangdebizi](https://github.com/guangxiangdebizi/)
- **NPM**: [@xingyuchen](https://www.npmjs.com/~xingyuchen)
- **NPM 包**: [financemcp-dcths](https://www.npmjs.com/package/financemcp-dcths)

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP SDK
- [Tushare](https://tushare.pro/) - 金融数据 API
- 东方财富、同花顺 - 数据来源

## 📮 反馈与贡献

欢迎提交 Issue 和 Pull Request！

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📖 改进文档
- 🔧 提交代码

---

**⚠️ 免责声明**：

本工具仅供学习和研究使用，数据来源于 Tushare API。使用本工具需要遵守 Tushare 的使用条款。任何投资决策请谨慎，本工具作者不承担任何投资风险和损失。

