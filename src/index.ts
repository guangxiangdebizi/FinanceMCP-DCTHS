#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// 引入业务工具
import { thsIndex } from "./tools/thsIndex.js";
import { thsDaily } from "./tools/thsDaily.js";
import { thsMember } from "./tools/thsMember.js";
import { dcIndex } from "./tools/dcIndex.js";
import { dcMember } from "./tools/dcMember.js";
import { dcDaily } from "./tools/dcDaily.js";

// 创建 MCP server
const server = new Server(
  {
    name: "FinanceMCP-DCTHS",
    version: "1.0.3",
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
        name: thsIndex.name,
        description: thsIndex.description,
        inputSchema: thsIndex.parameters
      },
      {
        name: thsDaily.name,
        description: thsDaily.description,
        inputSchema: thsDaily.parameters
      },
      {
        name: thsMember.name,
        description: thsMember.description,
        inputSchema: thsMember.parameters
      },
      {
        name: dcIndex.name,
        description: dcIndex.description,
        inputSchema: dcIndex.parameters
      },
      {
        name: dcMember.name,
        description: dcMember.description,
        inputSchema: dcMember.parameters
      },
      {
        name: dcDaily.name,
        description: dcDaily.description,
        inputSchema: dcDaily.parameters
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
    case "get_ths_index":
      return await thsIndex.run(args || {}, token);

    case "get_ths_daily":
      return await thsDaily.run(args || {}, token);

    case "get_ths_member":
      return await thsMember.run(args || {}, token);

    case "get_dc_index":
      return await dcIndex.run(args || {}, token);

    case "get_dc_member":
      return await dcMember.run(args || {}, token);

    case "get_dc_daily":
      return await dcDaily.run(args || {}, token);

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
