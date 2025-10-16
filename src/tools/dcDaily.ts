import { TushareClient } from "../utils/tushareClient.js";

/**
 * 东方财富板块行情
 * 接口：dc_daily
 * 描述：获取东财概念板块、行业指数板块、地域板块行情数据
 */
export const dcDaily = {
  name: "get_dc_daily",
  description: "获取东方财富板块行情数据。包含开盘价、收盘价、涨跌幅、成交量等信息。支持概念板块、行业板块、地域板块。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "板块代码（格式：xxxxx.DC）"
      },
      trade_date: {
        type: "string",
        description: "交易日期（YYYYMMDD格式，如 20231201）"
      },
      start_date: {
        type: "string",
        description: "开始日期（YYYYMMDD格式）"
      },
      end_date: {
        type: "string",
        description: "结束日期（YYYYMMDD格式）"
      },
      idx_type: {
        type: "string",
        description: "板块类型：概念板块、行业板块、地域板块"
      }
    },
    required: []
  },

  async run(args: { 
    ts_code?: string; 
    trade_date?: string; 
    start_date?: string; 
    end_date?: string;
    idx_type?: string;
  }, token?: string) {
    try {
      const client = new TushareClient(token);

      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.trade_date) params.trade_date = args.trade_date;
      if (args.start_date) params.start_date = args.start_date;
      if (args.end_date) params.end_date = args.end_date;
      if (args.idx_type) params.idx_type = args.idx_type;

      const data = await client.call("dc_daily", params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 东方财富板块行情查询结果\n\n暂无数据`
          }]
        };
      }

      let resultText = `📊 东方财富板块行情查询结果\n\n`;
      resultText += `查询条件：${args.ts_code || "全部"} ${args.trade_date || args.start_date + "~" + args.end_date || ""}\n`;
      if (args.idx_type) resultText += `板块类型：${args.idx_type}\n`;
      resultText += `\n共 ${formattedData.length} 条数据，显示前 20 条：\n\n`;
      
      const displayData = formattedData.slice(0, 20);
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.ts_code || ""} (${item.trade_date || ""})\n`;
        Object.entries(item).forEach(([key, value]) => {
          resultText += `- **${key}**: ${value}\n`;
        });
        resultText += `\n`;
      });

      return {
        content: [{
          type: "text" as const,
          text: resultText
        }]
      };

    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 板块代码格式是否正确（xxxxx.DC）\n3. 日期格式是否正确（YYYYMMDD）\n4. 是否有该接口的访问权限（需6000积分）`
        }],
        isError: true
      };
    }
  }
};

