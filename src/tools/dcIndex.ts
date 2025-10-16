import { TushareClient } from "../utils/tushareClient.js";

/**
 * 东方财富板块信息
 * 接口：dc_index
 * 描述：获取东方财富每个交易日的概念板块数据
 */
export const dcIndex = {
  name: "get_dc_index",
  description: "获取东方财富概念板块信息。包含板块涨跌幅、领涨股、总市值、换手率等数据。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "指数代码（支持多个代码同时输入，用逗号分隔）"
      },
      name: {
        type: "string",
        description: "板块名称（例如：人形机器人）"
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
      }
    },
    required: []
  },

  async run(args: { 
    ts_code?: string; 
    name?: string;
    trade_date?: string; 
    start_date?: string; 
    end_date?: string;
  }, token?: string) {
    try {
      const client = new TushareClient(token);

      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.name) params.name = args.name;
      if (args.trade_date) params.trade_date = args.trade_date;
      if (args.start_date) params.start_date = args.start_date;
      if (args.end_date) params.end_date = args.end_date;

      const data = await client.call("dc_index", params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 东方财富板块信息查询结果\n\n暂无数据`
          }]
        };
      }

      let resultText = `📊 东方财富概念板块信息查询结果\n\n`;
      resultText += `查询条件：${args.ts_code || args.name || "全部"} ${args.trade_date || args.start_date + "~" + args.end_date || ""}\n\n`;
      resultText += `共 ${formattedData.length} 条数据，显示前 20 条：\n\n`;
      
      const displayData = formattedData.slice(0, 20);
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.name || ""} (${item.ts_code || ""}) - ${item.trade_date || ""}\n`;
        resultText += `- **涨跌幅**: ${item.pct_change}%\n`;
        resultText += `- **领涨股**: ${item.leading || ""} (${item.leading_code || ""})\n`;
        resultText += `- **领涨股涨跌幅**: ${item.leading_pct}%\n`;
        resultText += `- **总市值**: ${item.total_mv}万元\n`;
        resultText += `- **换手率**: ${item.turnover_rate}%\n`;
        resultText += `- **上涨家数**: ${item.up_num}\n`;
        resultText += `- **下降家数**: ${item.down_num}\n\n`;
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
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 日期格式是否正确（YYYYMMDD）\n3. 是否有该接口的访问权限（需6000积分）`
        }],
        isError: true
      };
    }
  }
};

