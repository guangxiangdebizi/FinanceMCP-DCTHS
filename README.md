# FinanceMCP-DCTHS

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

### 📦 安装依赖

```bash
npm install
```

### 🔑 配置 Tushare Token

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Tushare Token：
```env
TUSHARE_TOKEN=your_tushare_token_here
```

### 🔨 构建项目

```bash
npm run build
```

### ▶️ 运行服务器

#### stdio 模式（推荐本地使用）

```bash
npm run start:stdio
```

或通过 npx：
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

在 Claude Desktop 或其他 MCP 客户端的配置文件中：

```json
{
  "mcpServers": {
    "financemcp-dcths": {
      "command": "npx",
      "args": ["-y", "financemcp-dcths"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
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
        "X-Tushare-Token": "your_tushare_token_here"
      }
    }
  }
}
```

**HTTP 模式支持三种 Token 传递方式：**

1. `X-Tushare-Token` 请求头
2. `X-Api-Key` 请求头
3. `Authorization: Bearer <token>` 请求头

## 💡 使用示例

### 查询个股资金流向

```typescript
{
  "name": "get_stock_moneyflow",
  "arguments": {
    "ts_code": "000001.SZ",
    "trade_date": "20231201",
    "data_source": "dongcai"  // 或 "tonghuashun"
  }
}
```

### 查询板块资金流向

```typescript
{
  "name": "get_block_moneyflow",
  "arguments": {
    "trade_date": "20231201",
    "data_source": "tonghuashun"  // 或 "dongcai"
  }
}
```

### 查询板块成分

```typescript
{
  "name": "get_block_member",
  "arguments": {
    "block_code": "BK0001",
    "data_source": "dongcai"  // 或 "tonghuashun"
  }
}
```

## 📚 API 说明

### 数据源参数 (data_source)

- `dongcai` - 东财数据源
- `tonghuashun` - 同花顺数据源

### 日期格式

所有日期参数使用 `YYYYMMDD` 格式，例如：`20231201`

### 股票代码格式

- 深交所：`000001.SZ`
- 上交所：`600000.SH`

## 🔐 Token 安全

- **本地开发**：使用 `.env` 文件存储 Token（已在 `.gitignore` 中排除）
- **生产部署**：使用系统环境变量或 Docker secrets
- **客户端配置**：在客户端配置文件中传递 Token

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

## 📄 License

Apache-2.0 License

## 👤 作者

- **LinkedIn**: [Xingyu Chen](https://www.linkedin.com/in/xingyu-chen-b5b3b0313/)
- **Email**: guangxiangdebizi@gmail.com
- **GitHub**: [@guangxiangdebizi](https://github.com/guangxiangdebizi/)
- **NPM**: [@xingyuchen](https://www.npmjs.com/~xingyuchen)

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP SDK
- [Tushare](https://tushare.pro/) - 金融数据 API

---

**注意**：使用本工具需要有效的 Tushare API Token。你可以在 [Tushare 官网](https://tushare.pro/) 注册并获取 Token。

