#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 引入业务工具
import { moneyflow } from "./tools/moneyflow.js";
import { blockMoneyflow } from "./tools/blockMoneyflow.js";
import { blockMember } from "./tools/blockMember.js";

// 创建 MCP server
const server = new Server(
  {
    name: "FinanceMCP-DCTHS",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 工具：列出所有工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: moneyflow.name,
        description: moneyflow.description,
        inputSchema: moneyflow.parameters
      },
      {
        name: blockMoneyflow.name,
        description: blockMoneyflow.description,
        inputSchema: blockMoneyflow.parameters
      },
      {
        name: blockMember.name,
        description: blockMember.description,
        inputSchema: blockMember.parameters
      }
    ]
  };
});

// 工具：执行工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // 从环境变量获取 Tushare Token
  const token = process.env.TUSHARE_TOKEN;
  
  switch (name) {
    case "get_stock_moneyflow": {
      return await moneyflow.run({
        ts_code: args?.ts_code ? String(args.ts_code) : undefined,
        trade_date: args?.trade_date ? String(args.trade_date) : undefined,
        start_date: args?.start_date ? String(args.start_date) : undefined,
        end_date: args?.end_date ? String(args.end_date) : undefined,
        data_source: String(args?.data_source) as "dongcai" | "tonghuashun"
      }, token);
    }

    case "get_block_moneyflow": {
      return await blockMoneyflow.run({
        block_code: args?.block_code ? String(args.block_code) : undefined,
        trade_date: args?.trade_date ? String(args.trade_date) : undefined,
        start_date: args?.start_date ? String(args.start_date) : undefined,
        end_date: args?.end_date ? String(args.end_date) : undefined,
        data_source: String(args?.data_source) as "dongcai" | "tonghuashun"
      }, token);
    }

    case "get_block_member": {
      return await blockMember.run({
        ts_code: args?.ts_code ? String(args.ts_code) : undefined,
        block_code: args?.block_code ? String(args.block_code) : undefined,
        data_source: String(args?.data_source) as "dongcai" | "tonghuashun"
      }, token);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// 启动 stdio 传输
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FinanceMCP-DCTHS Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

