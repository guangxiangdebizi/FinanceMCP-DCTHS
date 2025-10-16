#!/usr/bin/env node
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

// 导入业务工具
import { moneyflow } from "./tools/moneyflow.js";
import { blockMoneyflow } from "./tools/blockMoneyflow.js";
import { blockMember } from "./tools/blockMember.js";

// 会话存储（无状态HTTP下用header维护会话）
interface Session { id: string; server: Server; createdAt: Date; lastActivity: Date }
const sessions = new Map<string, Session>();

function createMCPServer(): Server {
  const server = new Server(
    { name: "FinanceMCP-DCTHS", version: "1.0.0" }, 
    { capabilities: { tools: {} } }
  );

  const tools: Tool[] = [
    { name: moneyflow.name, description: moneyflow.description, inputSchema: moneyflow.parameters as any },
    { name: blockMoneyflow.name, description: blockMoneyflow.description, inputSchema: blockMoneyflow.parameters as any },
    { name: blockMember.name, description: blockMember.description, inputSchema: blockMember.parameters as any }
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params as any;
    
    // 从环境变量或请求头获取 token（这里先从环境变量）
    const token = process.env.TUSHARE_TOKEN;
    
    switch (name) {
      case "get_stock_moneyflow": 
        return await moneyflow.run(args, token);
      case "get_block_moneyflow": 
        return await blockMoneyflow.run(args, token);
      case "get_block_member": 
        return await blockMember.run(args, token);
      default: 
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  return server;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// CORS 配置，允许自定义 Header
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Accept', 'Authorization', 'Mcp-Session-Id',
    'X-Tushare-Token', 'X-Api-Key'
  ],
  exposedHeaders: ['Content-Type', 'Mcp-Session-Id']
}));

app.use(express.json({ limit: "10mb" }));

// 从请求头提取 Tushare Token
function extractTokenFromHeaders(req: Request): string | undefined {
  // 优先从 X-Tushare-Token 获取
  const tushareHeader = req.headers['x-tushare-token'] as string | undefined;
  if (tushareHeader?.trim()) return tushareHeader.trim();
  
  // 其次从 X-Api-Key 获取
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  if (apiKeyHeader?.trim()) return apiKeyHeader.trim();
  
  // 最后从 Authorization Bearer 获取
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  
  // 如果都没有，返回环境变量的 token
  return process.env.TUSHARE_TOKEN;
}

// 健康检查
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "healthy", 
    transport: "streamable-http", 
    activeSessions: sessions.size,
    server: "FinanceMCP-DCTHS",
    version: "1.0.0"
  });
});

// Streamable HTTP 主端点：POST /mcp（JSON-RPC）
app.all("/mcp", async (req: Request, res: Response) => {
  const sessionIdHeader = req.headers["mcp-session-id"] as string | undefined;
  const method = req.method.toUpperCase();

  if (method === "POST") {
    const body = req.body;
    if (!body) return res.status(400).json({ jsonrpc: "2.0", error: { code: -32600, message: "Empty body" }, id: null });

    // 忽略通知（如 notifications/initialized）
    const isNotification = (body.id === undefined || body.id === null) && typeof body.method === "string" && body.method.startsWith("notifications/");
    if (isNotification) {
      if (sessionIdHeader && sessions.has(sessionIdHeader)) sessions.get(sessionIdHeader)!.lastActivity = new Date();
      return res.status(204).end();
    }

    // 初始化/会话管理
    const isInit = body.method === "initialize";
    let session: Session | undefined;
    if (sessionIdHeader && sessions.has(sessionIdHeader)) {
      session = sessions.get(sessionIdHeader)!; session.lastActivity = new Date();
    } else if (isInit) {
      const newId = randomUUID();
      const server = createMCPServer();
      session = { id: newId, server, createdAt: new Date(), lastActivity: new Date() };
      sessions.set(newId, session); res.setHeader("Mcp-Session-Id", newId);
    } else {
      return res.status(400).json({ jsonrpc: "2.0", error: { code: -32000, message: "No session and not initialize" }, id: null });
    }

    // 处理核心方法
    if (body.method === "initialize") {
      return res.json({ 
        jsonrpc: "2.0", 
        result: { 
          protocolVersion: "2024-11-05", 
          capabilities: { tools: {} }, 
          serverInfo: { name: "FinanceMCP-DCTHS", version: "1.0.0" } 
        }, 
        id: body.id 
      });
    }
    
    if (body.method === "tools/list") {
      const tools = [
        { name: moneyflow.name, description: moneyflow.description, inputSchema: moneyflow.parameters },
        { name: blockMoneyflow.name, description: blockMoneyflow.description, inputSchema: blockMoneyflow.parameters },
        { name: blockMember.name, description: blockMember.description, inputSchema: blockMember.parameters }
      ];
      return res.json({ jsonrpc: "2.0", result: { tools }, id: body.id });
    }
    
    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params;
      
      // 从请求头提取 token
      const token = extractTokenFromHeaders(req);
      
      let result: any;
      switch (name) {
        case "get_stock_moneyflow": 
          result = await moneyflow.run(args, token); 
          break;
        case "get_block_moneyflow": 
          result = await blockMoneyflow.run(args, token); 
          break;
        case "get_block_member": 
          result = await blockMember.run(args, token); 
          break;
        default: 
          throw new Error(`Unknown tool: ${name}`);
      }
      return res.json({ jsonrpc: "2.0", result, id: body.id });
    }

    return res.status(400).json({ jsonrpc: "2.0", error: { code: -32601, message: `Method not found: ${body.method}` }, id: body.id });
  }

  return res.status(405).json({ jsonrpc: "2.0", error: { code: -32600, message: "Method Not Allowed" }, id: null });
});

// 启动（Streamable HTTP 模式）
app.listen(PORT, () => {
  console.log(`🚀 FinanceMCP-DCTHS Server (Streamable HTTP)`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Tushare Token: ${process.env.TUSHARE_TOKEN ? '已配置' : '未配置（将从请求头读取）'}`);
});

