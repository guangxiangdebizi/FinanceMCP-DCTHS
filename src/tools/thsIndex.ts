import { TushareClient } from "../utils/tushareClient.js";

/**
 * 同花顺概念和行业指数
 * 接口：ths_index
 * 描述：获取同花顺板块指数列表
 */
export const thsIndex = {
  name: "get_ths_index",
  description: "获取同花顺概念和行业指数列表。可查询指数代码、市场类型、指数类型等信息。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "指数代码（如 885823.TI）"
      },
      exchange: {
        type: "string",
        description: "市场类型：A-A股 HK-港股 US-美股"
      },
      type: {
        type: "string",
        description: "指数类型：N-概念指数 I-行业指数 R-地域指数 S-同花顺特色指数 ST-同花顺风格指数 TH-同花顺主题指数 BB-同花顺宽基指数"
      }
    },
    required: []
  },

  async run(args: { 
    ts_code?: string; 
    exchange?: string; 
    type?: string;
  }, token?: string) {
    try {
      const client = new TushareClient(token);

      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.exchange) params.exchange = args.exchange;
      if (args.type) params.type = args.type;

      const data = await client.call("ths_index", params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 同花顺板块指数查询结果\n\n暂无数据`
          }]
        };
      }

      let resultText = `📊 同花顺概念和行业指数查询结果\n\n`;
      resultText += `共 ${formattedData.length} 条数据，显示前 50 条：\n\n`;
      
      const displayData = formattedData.slice(0, 50);
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.name || ""} (${item.ts_code || ""})\n`;
        resultText += `- **代码**: ${item.ts_code}\n`;
        resultText += `- **名称**: ${item.name}\n`;
        resultText += `- **成分个数**: ${item.count}\n`;
        resultText += `- **交易所**: ${item.exchange}\n`;
        resultText += `- **上市日期**: ${item.list_date}\n`;
        resultText += `- **类型**: ${item.type}\n\n`;
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
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 是否有该接口的访问权限（需6000积分）`
        }],
        isError: true
      };
    }
  }
};

